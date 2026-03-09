import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  Play, 
  Pause, 
  RotateCcw, 
  Save,
  Trash2,
  ChevronRight,
  Zap,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  description: string;
  variables: ScenarioVariable[];
  outcomes: ScenarioOutcome[];
  createdAt: string;
  savedAt?: string;
}

interface ScenarioVariable {
  id: string;
  name: string;
  type: 'number' | 'percentage' | 'boolean' | 'select';
  value: number | boolean | string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  icon: React.ReactNode;
}

interface ScenarioOutcome {
  id: string;
  name: string;
  value: number | string;
  change?: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

interface ContingencyOperatorsProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'lb_contingency_scenarios';

const DEFAULT_VARIABLES: ScenarioVariable[] = [
  {
    id: 'monthly-orders',
    name: 'Monthly Orders',
    type: 'number',
    value: 100,
    min: 10,
    max: 10000,
    step: 10,
    icon: <Package className="w-4 h-4" />
  },
  {
    id: 'avg-order-value',
    name: 'Avg Order Value',
    type: 'number',
    value: 50,
    min: 10,
    max: 500,
    step: 5,
    icon: <DollarSign className="w-4 h-4" />
  },
  {
    id: 'creator-cut',
    name: 'Creator Cut',
    type: 'percentage',
    value: 83.3,
    min: 50,
    max: 95,
    step: 0.1,
    icon: <TrendingUp className="w-4 h-4" />
  },
  {
    id: 'referral-rate',
    name: 'Referral Rate',
    type: 'percentage',
    value: 15,
    min: 0,
    max: 50,
    step: 1,
    icon: <Users className="w-4 h-4" />
  },
  {
    id: 'growth-rate',
    name: 'Monthly Growth',
    type: 'percentage',
    value: 10,
    min: -20,
    max: 100,
    step: 1,
    icon: <TrendingUp className="w-4 h-4" />
  },
  {
    id: 'time-horizon',
    name: 'Time Horizon',
    type: 'select',
    value: '12',
    options: [
      { value: '3', label: '3 months' },
      { value: '6', label: '6 months' },
      { value: '12', label: '1 year' },
      { value: '24', label: '2 years' },
      { value: '60', label: '5 years' }
    ],
    icon: <Clock className="w-4 h-4" />
  }
];

export const ContingencyOperators: React.FC<ContingencyOperatorsProps> = ({
  isOpen,
  onClose
}) => {
  const [variables, setVariables] = useState<ScenarioVariable[]>(DEFAULT_VARIABLES);
  const [outcomes, setOutcomes] = useState<ScenarioOutcome[]>([]);
  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSavedScenarios(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load scenarios');
      }
    }
  }, []);

  useEffect(() => {
    calculateOutcomes();
  }, [variables]);

  const calculateOutcomes = () => {
    const monthlyOrders = getVarValue('monthly-orders') as number;
    const avgOrderValue = getVarValue('avg-order-value') as number;
    const creatorCut = (getVarValue('creator-cut') as number) / 100;
    const referralRate = (getVarValue('referral-rate') as number) / 100;
    const growthRate = (getVarValue('growth-rate') as number) / 100;
    const timeHorizon = parseInt(getVarValue('time-horizon') as string);

    const monthlyRevenue = monthlyOrders * avgOrderValue;
    const creatorEarnings = monthlyRevenue * creatorCut;
    const platformMargin = monthlyRevenue * (1 - creatorCut);
    
    let totalRevenue = 0;
    let totalCreatorEarnings = 0;
    let finalMonthlyOrders = monthlyOrders;
    
    for (let month = 0; month < timeHorizon; month++) {
      const monthOrders = monthlyOrders * Math.pow(1 + growthRate, month);
      const monthRevenue = monthOrders * avgOrderValue;
      totalRevenue += monthRevenue;
      totalCreatorEarnings += monthRevenue * creatorCut;
      finalMonthlyOrders = monthOrders;
    }

    const referralCustomers = Math.floor(monthlyOrders * referralRate * timeHorizon);
    const referralBonus = referralCustomers * 5; // $5 per referral

    setOutcomes([
      {
        id: 'monthly-revenue',
        name: 'Monthly Revenue (Start)',
        value: `$${monthlyRevenue.toLocaleString()}`,
        trend: 'neutral',
        icon: <DollarSign className="w-4 h-4" />
      },
      {
        id: 'creator-monthly',
        name: 'Creator Monthly (Start)',
        value: `$${creatorEarnings.toLocaleString()}`,
        trend: 'up',
        icon: <TrendingUp className="w-4 h-4" />
      },
      {
        id: 'total-revenue',
        name: `Total Revenue (${timeHorizon}mo)`,
        value: `$${Math.round(totalRevenue).toLocaleString()}`,
        trend: 'up',
        icon: <DollarSign className="w-4 h-4" />
      },
      {
        id: 'total-creator',
        name: `Creator Earnings (${timeHorizon}mo)`,
        value: `$${Math.round(totalCreatorEarnings).toLocaleString()}`,
        trend: 'up',
        icon: <TrendingUp className="w-4 h-4" />
      },
      {
        id: 'final-orders',
        name: `Monthly Orders (End)`,
        value: Math.round(finalMonthlyOrders).toLocaleString(),
        change: Math.round(((finalMonthlyOrders - monthlyOrders) / monthlyOrders) * 100),
        trend: finalMonthlyOrders > monthlyOrders ? 'up' : 'down',
        icon: <Package className="w-4 h-4" />
      },
      {
        id: 'referral-bonus',
        name: 'Referral Bonus',
        value: `$${referralBonus.toLocaleString()}`,
        trend: referralBonus > 0 ? 'up' : 'neutral',
        icon: <Users className="w-4 h-4" />
      }
    ]);
  };

  const getVarValue = (id: string) => {
    return variables.find(v => v.id === id)?.value;
  };

  const updateVariable = (id: string, value: number | boolean | string) => {
    setVariables(prev => prev.map(v => 
      v.id === id ? { ...v, value } : v
    ));
  };

  const saveScenario = () => {
    if (!scenarioName.trim()) return;

    const scenario: Scenario = {
      id: 'scenario-' + Date.now(),
      name: scenarioName,
      description: `What if: ${variables.map(v => `${v.name}=${v.value}`).join(', ')}`,
      variables: [...variables],
      outcomes: [...outcomes],
      createdAt: new Date().toISOString(),
      savedAt: new Date().toISOString()
    };

    const updated = [...savedScenarios, scenario];
    setSavedScenarios(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setShowSaveDialog(false);
    setScenarioName('');
  };

  const loadScenario = (scenario: Scenario) => {
    setVariables(scenario.variables);
  };

  const deleteScenario = (id: string) => {
    const updated = savedScenarios.filter(s => s.id !== id);
    setSavedScenarios(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const resetToDefaults = () => {
    setVariables(DEFAULT_VARIABLES);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/10"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <GitBranch className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Contingency Operators</h2>
                  <p className="text-sm text-white/60">
                    "What If" Simulation System
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetToDefaults}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Reset to defaults"
                >
                  <RotateCcw className="w-5 h-5 text-white/60" />
                </button>
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Save scenario"
                >
                  <Save className="w-5 h-5 text-white/60" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* Variables Panel */}
            <div className="p-6 border-r border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Variables
              </h3>
              
              <div className="space-y-4">
                {variables.map(variable => (
                  <div key={variable.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400">{variable.icon}</span>
                        <span className="text-sm font-medium text-white">{variable.name}</span>
                      </div>
                      <span className="text-sm text-purple-400 font-mono">
                        {variable.type === 'percentage' ? `${variable.value}%` : variable.value}
                      </span>
                    </div>
                    
                    {variable.type === 'select' ? (
                      <select
                        value={variable.value as string}
                        onChange={e => updateVariable(variable.id, e.target.value)}
                        className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm"
                      >
                        {variable.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : variable.type === 'boolean' ? (
                      <button
                        onClick={() => updateVariable(variable.id, !variable.value)}
                        className={`w-full py-2 rounded-lg text-sm transition-colors ${
                          variable.value 
                            ? 'bg-purple-500 text-white' 
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {variable.value ? 'Enabled' : 'Disabled'}
                      </button>
                    ) : (
                      <input
                        type="range"
                        min={variable.min}
                        max={variable.max}
                        step={variable.step}
                        value={variable.value as number}
                        onChange={e => updateVariable(variable.id, parseFloat(e.target.value))}
                        className="w-full accent-purple-500"
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Saved Scenarios */}
              {savedScenarios.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-white/60 mb-3">Saved Scenarios</h4>
                  <div className="space-y-2">
                    {savedScenarios.map(scenario => (
                      <div
                        key={scenario.id}
                        className="p-3 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between"
                      >
                        <button
                          onClick={() => loadScenario(scenario)}
                          className="flex-1 text-left"
                        >
                          <div className="text-sm font-medium text-white">{scenario.name}</div>
                          <div className="text-xs text-white/40">
                            {new Date(scenario.createdAt).toLocaleDateString()}
                          </div>
                        </button>
                        <button
                          onClick={() => deleteScenario(scenario.id)}
                          className="p-1 hover:bg-white/10 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-white/40" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Outcomes Panel */}
            <div className="p-6 bg-black/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Projected Outcomes
              </h3>
              
              <div className="space-y-3">
                {outcomes.map(outcome => (
                  <motion.div
                    key={outcome.id}
                    layout
                    className="p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`${
                          outcome.trend === 'up' ? 'text-emerald-400' :
                          outcome.trend === 'down' ? 'text-red-400' :
                          'text-white/60'
                        }`}>
                          {outcome.icon}
                        </span>
                        <span className="text-sm text-white/80">{outcome.name}</span>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          outcome.trend === 'up' ? 'text-emerald-400' :
                          outcome.trend === 'down' ? 'text-red-400' :
                          'text-white'
                        }`}>
                          {outcome.value}
                        </div>
                        {outcome.change !== undefined && (
                          <div className={`text-xs ${
                            outcome.change > 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {outcome.change > 0 ? '+' : ''}{outcome.change}%
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Disclaimer */}
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-200 font-medium">Simulation Only</p>
                    <p className="text-xs text-yellow-200/70 mt-1">
                      These projections are hypothetical. Actual results may vary based on 
                      market conditions, effort, and other factors. This is not financial advice.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Dialog */}
          <AnimatePresence>
            {showSaveDialog && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-slate-800 p-6 rounded-xl max-w-sm w-full mx-4"
                >
                  <h3 className="text-lg font-bold text-white mb-4">Save Scenario</h3>
                  <input
                    type="text"
                    value={scenarioName}
                    onChange={e => setScenarioName(e.target.value)}
                    placeholder="Scenario name..."
                    className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white mb-4"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSaveDialog(false)}
                      className="flex-1 py-2 bg-white/10 text-white rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveScenario}
                      className="flex-1 py-2 bg-purple-500 text-white rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContingencyOperators;
