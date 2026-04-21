import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const mercuryApiKey = Deno.env.get("MERCURY_API_KEY");

    if (!mercuryApiKey) {
      return new Response(
        JSON.stringify({
          error: "Mercury API not configured",
          message: "Bank balance integration pending setup",
          mercury: null
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Mercury API Key length:", mercuryApiKey.length);
    console.log("Mercury API Key prefix:", mercuryApiKey.substring(0, 30));

    // Mercury's API documentation shows the endpoint and auth format
    // For tokens starting with mercury_production_ or mercury_sandbox_
    // Use Bearer token authentication

    const apiUrl = "https://api.mercury.com/api/v1/accounts";

    console.log("Making request to:", apiUrl);
    console.log("Using Bearer token auth");

    // Create the request with explicit headers
    const headers = new Headers();
    headers.set("Authorization", `Bearer ${mercuryApiKey}`);
    headers.set("Accept", "application/json");

    console.log("Headers being sent:", {
      "Authorization": `Bearer ${mercuryApiKey.substring(0, 20)}...`,
      "Accept": "application/json"
    });

    const accountsResponse = await fetch(apiUrl, {
      method: "GET",
      headers: headers,
    });

    console.log("Response status:", accountsResponse.status);
    console.log("Response headers:", Object.fromEntries(accountsResponse.headers.entries()));

    const responseText = await accountsResponse.text();
    console.log("Response body:", responseText.substring(0, 500));

    if (!accountsResponse.ok) {
      let errorInfo;
      try {
        errorInfo = JSON.parse(responseText);
      } catch {
        errorInfo = { raw: responseText };
      }

      return new Response(
        JSON.stringify({
          error: `Mercury API error: ${accountsResponse.status}`,
          details: errorInfo,
          tokenInfo: {
            length: mercuryApiKey.length,
            prefix: mercuryApiKey.substring(0, 25),
            hasSpaces: mercuryApiKey.includes(" "),
            hasNewlines: mercuryApiKey.includes("\n"),
          },
          message: "Could not connect to Mercury bank API",
          troubleshooting: [
            "1. Verify the API key in Mercury Dashboard → Settings → Developers → API Tokens",
            "2. Ensure the token has 'Read accounts' permission",
            "3. Check if the token is for Production (not Sandbox)",
            "4. Try regenerating the API token",
          ],
          mercury: null
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse successful response
    let accountsData;
    try {
      accountsData = JSON.parse(responseText);
    } catch (e) {
      return new Response(
        JSON.stringify({
          error: "Failed to parse Mercury response",
          raw: responseText.substring(0, 500),
          mercury: null
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Accounts data keys:", Object.keys(accountsData));

    const accounts = accountsData.accounts || [];
    console.log("Number of accounts:", accounts.length);

    if (accounts.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No Mercury accounts found",
          mercury: {
            totalBalance: 0,
            totalAvailable: 0,
            accounts: []
          }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process accounts
    const accountBalances = [];
    for (const account of accounts) {
      console.log("Processing account:", account.id);

      let transactions = [];
      try {
        const txHeaders = new Headers();
        txHeaders.set("Authorization", `Bearer ${mercuryApiKey}`);
        txHeaders.set("Accept", "application/json");

        const txResponse = await fetch(
          `https://api.mercury.com/api/v1/account/${account.id}/transactions?limit=10`,
          { method: "GET", headers: txHeaders }
        );

        if (txResponse.ok) {
          const txData = await txResponse.json();
          transactions = txData.transactions || [];
        }
      } catch (e) {
        console.error("Error fetching transactions:", e);
      }

      accountBalances.push({
        accountId: account.id,
        accountName: account.name || account.nickname || "Account",
        accountNumber: account.accountNumber ? `****${account.accountNumber.slice(-4)}` : "****",
        currentBalance: account.currentBalance ?? account.balance ?? 0,
        availableBalance: account.availableBalance ?? account.balance ?? 0,
        recentTransactions: transactions.slice(0, 10).map((tx: any) => {
          // Sanitize descriptions to protect privacy
          // Show transaction type but hide personal account details
          let safeDescription = "Transaction";
          const amount = tx.amount || 0;

          if (amount > 0) {
            // Incoming money - categorize by type
            if (tx.kind === 'externalTransfer' || tx.description?.toLowerCase().includes('transfer')) {
              safeDescription = "Owner Deposit";
            } else if (tx.kind === 'internalTransfer') {
              safeDescription = "Internal Transfer";
            } else if (tx.description?.toLowerCase().includes('stripe')) {
              safeDescription = "Stripe Payout (Donations)";
            } else {
              safeDescription = "Deposit";
            }
          } else {
            // Outgoing money - categorize by type
            if (tx.description?.toLowerCase().includes('gift') || tx.description?.toLowerCase().includes('amazon') || tx.description?.toLowerCase().includes('walmart') || tx.description?.toLowerCase().includes('target')) {
              safeDescription = "Gift Purchase";
            } else if (tx.description?.toLowerCase().includes('shipping') || tx.description?.toLowerCase().includes('usps') || tx.description?.toLowerCase().includes('ups') || tx.description?.toLowerCase().includes('fedex')) {
              safeDescription = "Shipping Cost";
            } else {
              safeDescription = "Expense";
            }
          }

          return {
            id: tx.id,
            date: tx.postedAt || tx.createdAt,
            amount: amount,
            description: safeDescription,
            type: amount > 0 ? 'credit' : 'debit',
            status: tx.status,
          };
        }),
      });
    }

    const totalBalance = accountBalances.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const totalAvailable = accountBalances.reduce((sum, acc) => sum + acc.availableBalance, 0);

    return new Response(JSON.stringify({
      lastUpdated: new Date().toISOString(),
      mercury: {
        totalBalance,
        totalAvailable,
        accounts: accountBalances,
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Mercury function error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
        mercury: null
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
