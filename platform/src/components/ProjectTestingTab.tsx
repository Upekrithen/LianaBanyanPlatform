import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Play, Save, Trash2, Plus, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

interface TestSuite {
  id: string;
  name: string;
  project_id: string;
  test_config: {
    tests: string[];
    frequency?: string;
    enabled: boolean;
  };
  last_run?: string;
  last_status?: "success" | "failure" | "partial";
  created_at: string;
}

interface TestResult {
  id: string;
  suite_id: string;
  test_name: string;
  status: "passed" | "failed" | "skipped";
  message?: string;
  timestamp: string;
}

const DEFAULT_TEST_TYPES = [
  { id: "route_accessibility", label: "Route Accessibility", description: "Verify all routes are reachable" },
  { id: "component_rendering", label: "Component Rendering", description: "Check if components render without errors" },
  { id: "data_loading", label: "Data Loading", description: "Test database queries and data fetching" },
  { id: "permissions", label: "Permissions & RLS", description: "Validate role-based access controls" },
  { id: "navigation", label: "Navigation Flow", description: "Verify navigation paths and redirects" },
  { id: "form_validation", label: "Form Validation", description: "Test form inputs and validation rules" },
  { id: "api_endpoints", label: "API Endpoints", description: "Check edge function responses" },
];

interface ProjectTestingTabProps {
  projectId: string;
}

export const ProjectTestingTab = ({ projectId }: ProjectTestingTabProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newSuiteName, setNewSuiteName] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [customTests, setCustomTests] = useState<Array<{ id: string; label: string; description: string }>>([]);
  const [newCustomTest, setNewCustomTest] = useState({ label: "", description: "" });
  const [frequency, setFrequency] = useState<string>("manual");
  const [editingSuiteId, setEditingSuiteId] = useState<string | null>(null);

  // Check if user has permission to manage tests
  const { data: hasPermission, isLoading: checkingPermission } = useQuery({
    queryKey: ['test-permission', projectId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      // Check if user is project owner
      const { data: project } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .single();
      
      if (project?.owner_id === user.id) return true;
      
      // Check if user is Steward or has authorized position
      const { data: contract } = await supabase
        .from('project_member_contracts')
        .select('contract_title')
        .eq('project_id', projectId)
        .eq('member_id', user.id)
        .eq('status', 'active')
        .single();
      
      if (contract && (contract.contract_title.toLowerCase() === 'steward' || 
                       contract.contract_title.toLowerCase() === 'hr')) {
        return true;
      }
      
      return false;
    },
    enabled: !!user && !!projectId,
  });

  // Fetch test suites
  const { data: testSuites, isLoading: loadingSuites } = useQuery({
    queryKey: ['test-suites', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_test_suites')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(suite => ({
        ...suite,
        test_config: suite.test_config as { tests: string[]; frequency?: string; enabled: boolean }
      })) as TestSuite[];
    },
    enabled: !!hasPermission,
  });

  // Fetch recent test results
  const { data: recentResults } = useQuery({
    queryKey: ['test-results', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_test_results')
        .select('*')
        .eq('project_id', projectId)
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as TestResult[];
    },
    enabled: !!hasPermission,
  });

  // Save test suite mutation
  const saveSuiteMutation = useMutation({
    mutationFn: async () => {
      const suiteData = {
        name: newSuiteName,
        project_id: projectId,
        test_config: {
          tests: selectedTests,
          frequency,
          enabled: true,
        },
      };

      if (editingSuiteId) {
        const { error } = await supabase
          .from('project_test_suites')
          .update(suiteData)
          .eq('id', editingSuiteId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('project_test_suites')
          .insert(suiteData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-suites', projectId] });
      toast.success(editingSuiteId ? "Test suite updated" : "Test suite created");
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to save test suite: ${error.message}`);
    },
  });

  // Delete test suite mutation
  const deleteSuiteMutation = useMutation({
    mutationFn: async (suiteId: string) => {
      const { error } = await supabase
        .from('project_test_suites')
        .delete()
        .eq('id', suiteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-suites', projectId] });
      toast.success("Test suite deleted");
    },
  });

  const resetForm = () => {
    setNewSuiteName("");
    setSelectedTests([]);
    setFrequency("manual");
    setEditingSuiteId(null);
  };

  const handleToggleTest = (testId: string) => {
    setSelectedTests(prev =>
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };

  const handleAddCustomTest = () => {
    if (newCustomTest.label && newCustomTest.description) {
      const customId = `custom_${Date.now()}`;
      setCustomTests([...customTests, { id: customId, ...newCustomTest }]);
      setNewCustomTest({ label: "", description: "" });
      toast.success("Custom test added");
    }
  };

  const handleEditSuite = (suite: TestSuite) => {
    setEditingSuiteId(suite.id);
    setNewSuiteName(suite.name);
    setSelectedTests(suite.test_config.tests);
    setFrequency(suite.test_config.frequency || "manual");
  };

  const allTestTypes = [...DEFAULT_TEST_TYPES, ...customTests];

  if (checkingPermission) {
    return <div className="p-6">Loading...</div>;
  }

  if (!hasPermission) {
    return (
      <Card className="m-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Access Restricted
          </CardTitle>
          <CardDescription>
            Only project owners, stewards, and authorized positions can access the testing framework.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="suites" className="w-full">
        <TabsList>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="results">Recent Results</TabsTrigger>
          <TabsTrigger value="pathways">Pathways (Beta)</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-6">
          {/* Create/Edit Test Suite */}
          <Card>
            <CardHeader>
              <CardTitle>{editingSuiteId ? "Edit" : "Create"} Test Suite</CardTitle>
              <CardDescription>
                Select tests to run and configure execution frequency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="suite-name">Test Suite Name</Label>
                <Input
                  id="suite-name"
                  placeholder="e.g., Pre-deployment Check"
                  value={newSuiteName}
                  onChange={(e) => setNewSuiteName(e.target.value)}
                />
              </div>

              <div>
                <Label>Select Tests</Label>
                <div className="grid gap-3 mt-2">
                  {allTestTypes.map(test => (
                    <div key={test.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={test.id}
                        checked={selectedTests.includes(test.id)}
                        onCheckedChange={() => handleToggleTest(test.id)}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={test.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {test.label}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {test.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Custom Test */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-sm">Add Custom Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Test name"
                    value={newCustomTest.label}
                    onChange={(e) => setNewCustomTest({ ...newCustomTest, label: e.target.value })}
                  />
                  <Input
                    placeholder="Test description"
                    value={newCustomTest.description}
                    onChange={(e) => setNewCustomTest({ ...newCustomTest, description: e.target.value })}
                  />
                  <Button size="sm" variant="outline" onClick={handleAddCustomTest}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Test
                  </Button>
                </CardContent>
              </Card>

              <div>
                <Label htmlFor="frequency">Run Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Only</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="before-deploy">Before Each Deployment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => saveSuiteMutation.mutate()}
                  disabled={!newSuiteName || selectedTests.length === 0 || saveSuiteMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingSuiteId ? "Update" : "Save"} Suite
                </Button>
                {editingSuiteId && (
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Existing Test Suites */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Saved Test Suites</h3>
            {loadingSuites ? (
              <div>Loading suites...</div>
            ) : testSuites && testSuites.length > 0 ? (
              testSuites.map(suite => (
                <Card key={suite.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{suite.name}</CardTitle>
                        <CardDescription>
                          {suite.test_config.tests.length} tests • {suite.test_config.frequency || "manual"}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-2" />
                          Run
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditSuite(suite)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSuiteMutation.mutate(suite.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {suite.last_status && (
                        <>
                          {suite.last_status === "success" && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Last run: Passed
                            </Badge>
                          )}
                          {suite.last_status === "failure" && (
                            <Badge variant="outline" className="text-red-600">
                              <XCircle className="h-3 w-3 mr-1" />
                              Last run: Failed
                            </Badge>
                          )}
                          {suite.last_run && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(suite.last_run).toLocaleString()}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-6 text-center text-muted-foreground">
                  No test suites yet. Create your first one above.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
              <CardDescription>View the latest test execution results</CardDescription>
            </CardHeader>
            <CardContent>
              {recentResults && recentResults.length > 0 ? (
                <div className="space-y-2">
                  {recentResults.map(result => (
                    <div key={result.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <span className="font-medium">{result.test_name}</span>
                        {result.message && (
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {result.status === "passed" && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Passed
                          </Badge>
                        )}
                        {result.status === "failed" && (
                          <Badge variant="outline" className="text-red-600">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No test results yet. Run a test suite to see results here.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pathways">
          <Card>
            <CardHeader>
              <CardTitle>User Pathways & Decision Nodes</CardTitle>
              <CardDescription>
                Visual pathway testing with decision node validation (Beta)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This feature will allow you to define user pathways with decision nodes and test entire flows.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
