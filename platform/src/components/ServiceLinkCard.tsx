import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingDown,
  TrendingUp,
  MinusCircle,
  Shield
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ServiceLinkCardProps {
  link: {
    id: string;
    service_platform: string;
    platform_profile_url: string;
    platform_username: string | null;
    verification_status: string;
    advertised_rate_min: number | null;
    advertised_rate_max: number | null;
    lb_rate_category: string | null;
    rate_differential_flagged: boolean;
    lb_contracts_completed: number;
    external_contracts_completed: number;
    violations_count: number;
    is_active: boolean;
  };
  onDelete: (id: string) => void;
  lbScaleRate?: number | null;
}

export function ServiceLinkCard({ link, onDelete, lbScaleRate }: ServiceLinkCardProps) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  const getVerificationIcon = () => {
    switch (link.verification_status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "flagged":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  const getRateComplianceStatus = () => {
    if (!lbScaleRate || !link.advertised_rate_min) return null;
    
    const differential = ((link.advertised_rate_min - lbScaleRate) / lbScaleRate) * 100;
    
    if (differential < -10) {
      return {
        status: "below",
        icon: <TrendingDown className="h-4 w-4 text-destructive" />,
        message: `${Math.abs(differential).toFixed(0)}% below LB scale rate`,
        variant: "destructive" as const
      };
    } else if (differential > 10) {
      return {
        status: "above",
        icon: <TrendingUp className="h-4 w-4 text-success" />,
        message: `${differential.toFixed(0)}% above LB scale rate`,
        variant: "default" as const
      };
    } else {
      return {
        status: "compliant",
        icon: <CheckCircle className="h-4 w-4 text-success" />,
        message: "Compliant with LB rates",
        variant: "secondary" as const
      };
    }
  };

  const rateCompliance = getRateComplianceStatus();
  const totalContracts = link.lb_contracts_completed + link.external_contracts_completed;
  const lbContractRatio = totalContracts > 0 
    ? ((link.lb_contracts_completed / totalContracts) * 100).toFixed(0) 
    : "0";

  return (
    <Card className={link.rate_differential_flagged ? "border-destructive" : ""}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold capitalize">{link.service_platform}</h3>
                {getVerificationIcon()}
                
                <Badge variant={link.is_active ? "default" : "secondary"}>
                  {link.verification_status}
                </Badge>
                
                {link.rate_differential_flagged && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Rate Flagged
                  </Badge>
                )}
                
                {link.violations_count > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <Shield className="h-3 w-3" />
                    {link.violations_count} violation{link.violations_count > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="h-3 w-3" />
                <a
                  href={link.platform_profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-primary transition-colors"
                >
                  {link.platform_username || link.platform_profile_url}
                </a>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(link.id)}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Rate Information */}
          {(link.advertised_rate_min !== null || link.advertised_rate_max !== null) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Advertised Rate: ${link.advertised_rate_min || 0} - ${link.advertised_rate_max || 0}/hr
                  </p>
                  {link.lb_rate_category && (
                    <p className="text-xs text-muted-foreground">Category: {link.lb_rate_category}</p>
                  )}
                </div>
                
                {rateCompliance && (
                  <Badge variant={rateCompliance.variant} className="gap-1">
                    {rateCompliance.icon}
                    {rateCompliance.message}
                  </Badge>
                )}
              </div>

              {lbScaleRate && (
                <p className="text-xs text-muted-foreground">
                  LB Scale Rate: ${lbScaleRate}/hr
                </p>
              )}
            </div>
          )}

          {/* Contract Statistics */}
          <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold">{link.lb_contracts_completed}</p>
              <p className="text-xs text-muted-foreground">LB Contracts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{link.external_contracts_completed}</p>
              <p className="text-xs text-muted-foreground">External</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{lbContractRatio}%</p>
              <p className="text-xs text-muted-foreground">LB Ratio</p>
            </div>
          </div>

          {/* Violation Warning */}
          {link.rate_differential_flagged && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Rate Compliance Issue:</strong> Your advertised rates are significantly below 
                LB scale rates. This may result in violations if you accept work from LB members 
                at these rates. Please update your platform rates or contact support.
              </AlertDescription>
            </Alert>
          )}

          {/* Expanded Details Toggle */}
          {totalContracts > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full"
            >
              {showDetails ? "Hide" : "Show"} Contract Details
            </Button>
          )}

          {showDetails && totalContracts > 0 && (
            <div className="pt-2 space-y-2 border-t">
              <p className="text-sm font-medium">Contract Performance</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Total Contracts:</span>
                  <span className="font-medium text-foreground">{totalContracts}</span>
                </div>
                <div className="flex justify-between">
                  <span>LB Member Compliance:</span>
                  <span className={`font-medium ${link.violations_count === 0 ? 'text-success' : 'text-destructive'}`}>
                    {link.violations_count === 0 ? '✓ Compliant' : `${link.violations_count} violations`}
                  </span>
                </div>
                {link.lb_contracts_completed > 0 && (
                  <div className="flex justify-between">
                    <span>Avg. LB Contract Value:</span>
                    <span className="font-medium text-foreground">
                      ${(link.advertised_rate_min || 0) * 40}/contract
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
