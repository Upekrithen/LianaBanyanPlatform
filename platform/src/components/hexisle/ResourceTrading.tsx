import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowRightLeft, Droplets, Zap, Package, Utensils,
  TrendingUp, TrendingDown, Minus, Coins
} from 'lucide-react';
import { toast } from 'sonner';

interface Resource {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  currentPrice: number;
  priceChange: number; // Percentage
  quantity: number;
  maxCapacity: number;
}

interface TradeOrder {
  resourceId: string;
  type: 'buy' | 'sell';
  quantity: number;
  pricePerUnit: number;
}

const RESOURCES: Resource[] = [
  {
    id: 'water',
    name: 'Water',
    icon: <Droplets className="w-5 h-5" />,
    color: 'text-blue-400',
    currentPrice: 2,
    priceChange: 5.2,
    quantity: 100,
    maxCapacity: 500,
  },
  {
    id: 'credits',
    name: 'Credits',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-yellow-400',
    currentPrice: 1,
    priceChange: 0,
    quantity: 500,
    maxCapacity: 10000,
  },
  {
    id: 'materials',
    name: 'Materials',
    icon: <Package className="w-5 h-5" />,
    color: 'text-gray-400',
    currentPrice: 5,
    priceChange: -2.1,
    quantity: 50,
    maxCapacity: 200,
  },
  {
    id: 'food',
    name: 'Food',
    icon: <Utensils className="w-5 h-5" />,
    color: 'text-green-400',
    currentPrice: 3,
    priceChange: 8.5,
    quantity: 25,
    maxCapacity: 100,
  },
];

// Trade routes between cities
const TRADE_ROUTES = [
  { from: 'Marketplace Hub', to: 'Garden of Growth', bonus: '+15% Food', active: true },
  { from: 'Forge of Innovation', to: 'Harbor District', bonus: '+10% Materials', active: true },
  { from: 'Book of Peace Tower', to: 'Academy Heights', bonus: '+20% Knowledge', active: false },
];

interface ResourceTradingProps {
  resources?: Resource[];
  onTrade?: (order: TradeOrder) => void;
}

export function ResourceTrading({ 
  resources = RESOURCES, 
  onTrade 
}: ResourceTradingProps) {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState(1);

  const handleTrade = () => {
    if (!selectedResource) return;
    
    const order: TradeOrder = {
      resourceId: selectedResource.id,
      type: tradeType,
      quantity,
      pricePerUnit: selectedResource.currentPrice,
    };

    const totalCost = quantity * selectedResource.currentPrice;

    if (tradeType === 'buy') {
      const credits = resources.find(r => r.id === 'credits');
      if (credits && credits.quantity < totalCost) {
        toast.error('Insufficient credits');
        return;
      }
      toast.success(`Bought ${quantity} ${selectedResource.name} for ${totalCost} credits`);
    } else {
      if (selectedResource.quantity < quantity) {
        toast.error(`Insufficient ${selectedResource.name}`);
        return;
      }
      toast.success(`Sold ${quantity} ${selectedResource.name} for ${totalCost} credits`);
    }

    if (onTrade) {
      onTrade(order);
    }

    setQuantity(1);
  };

  const PriceIndicator = ({ change }: { change: number }) => {
    if (change > 0) {
      return (
        <span className="flex items-center text-green-500 text-sm">
          <TrendingUp className="w-4 h-4 mr-1" />
          +{change.toFixed(1)}%
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="flex items-center text-red-500 text-sm">
          <TrendingDown className="w-4 h-4 mr-1" />
          {change.toFixed(1)}%
        </span>
      );
    }
    return (
      <span className="flex items-center text-gray-500 text-sm">
        <Minus className="w-4 h-4 mr-1" />
        0%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Resource Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Your Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {resources.map(resource => (
              <div
                key={resource.id}
                className={`p-3 rounded-lg bg-muted cursor-pointer transition-all hover:bg-muted/80 ${
                  selectedResource?.id === resource.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedResource(resource)}
              >
                <div className={`flex items-center gap-2 ${resource.color}`}>
                  {resource.icon}
                  <span className="font-medium">{resource.name}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-2xl font-bold">{resource.quantity}</span>
                  <PriceIndicator change={resource.priceChange} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {resource.currentPrice} credits each
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trading Panel */}
      {selectedResource && selectedResource.id !== 'credits' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" />
              Trade {selectedResource.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Buy/Sell Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={tradeType === 'buy' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setTradeType('buy')}
                >
                  Buy
                </Button>
                <Button
                  variant={tradeType === 'sell' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setTradeType('sell')}
                >
                  Sell
                </Button>
              </div>

              {/* Quantity Slider */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Quantity</span>
                  <span className="text-sm font-medium">{quantity}</span>
                </div>
                <Slider
                  value={[quantity]}
                  onValueChange={([val]) => setQuantity(val)}
                  min={1}
                  max={tradeType === 'sell' ? selectedResource.quantity : 100}
                  step={1}
                />
              </div>

              {/* Price Summary */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Price per unit</span>
                  <span>{selectedResource.currentPrice} credits</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Quantity</span>
                  <span>× {quantity}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{quantity * selectedResource.currentPrice} credits</span>
                </div>
              </div>

              {/* Execute Trade */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleTrade}
              >
                {tradeType === 'buy' ? 'Buy' : 'Sell'} {quantity} {selectedResource.name}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Trade Routes */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TRADE_ROUTES.map((route, i) => (
              <div 
                key={i}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  route.active ? 'bg-green-500/10' : 'bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{route.from}</span>
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>{route.to}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={route.active ? 'default' : 'secondary'}>
                    {route.bonus}
                  </Badge>
                  {route.active ? (
                    <Badge className="bg-green-500">Active</Badge>
                  ) : (
                    <Badge variant="outline">Locked</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}







