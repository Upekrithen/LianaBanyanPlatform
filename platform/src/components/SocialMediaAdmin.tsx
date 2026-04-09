import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, Clock, Image, Send, Eye } from 'lucide-react';
import { 
  scheduleLittleRedHenPosts, 
  previewPosts, 
  PLATFORM_IMAGE_LIMITS,
  type ScheduleOptions 
} from '@/scripts/scheduleLittleRedHenPosts';
import { toLocalDateTimeInput, tomorrowAtNineLocal } from '@/components/scheduling/dateUtils';

const PLATFORMS = [
  { id: 'twitter', name: 'Twitter/X', icon: '𝕏' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'bluesky', name: 'Bluesky', icon: '🦋' },
  { id: 'threads', name: 'Threads', icon: '🧵' },
  { id: 'facebook', name: 'Facebook', icon: '📘' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'imgur', name: 'Imgur', icon: '🖼️' },
  { id: 'discord', name: 'Discord', icon: '💬' },
  { id: 'stackoverflow', name: 'Stack Overflow', icon: '📋' },
];

export function SocialMediaAdmin() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter', 'linkedin', 'bluesky']);
  const [intervalHours, setIntervalHours] = useState(24);
  const [startDate, setStartDate] = useState(() => toLocalDateTimeInput(tomorrowAtNineLocal()));
  const [isScheduling, setIsScheduling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const posts = previewPosts();
  
  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };
  
  const handleSchedule = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }
    
    setIsScheduling(true);
    
    try {
      const result = await scheduleLittleRedHenPosts({
        platforms: selectedPlatforms,
        startDate: new Date(startDate),
        intervalHours,
      });
      
      if (result.success) {
        toast.success(`Scheduled ${result.postsCreated} posts across ${selectedPlatforms.length} platforms!`);
      } else {
        toast.error(result.error || 'Failed to schedule posts');
      }
    } catch (error) {
      toast.error('Error scheduling posts');
      console.error(error);
    } finally {
      setIsScheduling(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Little Red Hen Story Campaign
          </CardTitle>
          <CardDescription>
            Schedule 25 posts telling the Little Red Hen story across social media platforms.
            Each act builds cumulatively, showing more images as the story progresses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Select Platforms</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLATFORMS.map(platform => (
                <div
                  key={platform.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPlatforms.includes(platform.id)
                      ? 'bg-green-500/10 border-green-500'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <Checkbox 
                    checked={selectedPlatforms.includes(platform.id)}
                    onCheckedChange={() => togglePlatform(platform.id)}
                  />
                  <span className="text-xl">{platform.icon}</span>
                  <div>
                    <div className="font-medium">{platform.name}</div>
                    <div className="text-xs text-white/50">
                      Max {PLATFORM_IMAGE_LIMITS[platform.id]} images
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Schedule Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4" />
                Start Date & Time
              </Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div>
              <Label htmlFor="interval" className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                Hours Between Posts
              </Label>
              <Input
                id="interval"
                type="number"
                min={1}
                max={168}
                value={intervalHours}
                onChange={(e) => setIntervalHours(parseInt(e.target.value) || 24)}
                className="bg-slate-800 border-slate-700"
              />
              <p className="text-xs text-white/50 mt-1">
                25 posts × {intervalHours}h = {Math.round(25 * intervalHours / 24)} days
              </p>
            </div>
          </div>
          
          {/* Summary */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Campaign Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-white/50">Total Posts</div>
                <div className="text-xl font-bold">25</div>
              </div>
              <div>
                <div className="text-white/50">Platforms</div>
                <div className="text-xl font-bold">{selectedPlatforms.length}</div>
              </div>
              <div>
                <div className="text-white/50">Total Scheduled</div>
                <div className="text-xl font-bold">{25 * selectedPlatforms.length}</div>
              </div>
              <div>
                <div className="text-white/50">Campaign Duration</div>
                <div className="text-xl font-bold">{Math.round(25 * intervalHours / 24)} days</div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Hide Preview' : 'Preview Posts'}
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={isScheduling || selectedPlatforms.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
              {isScheduling ? 'Scheduling...' : 'Schedule All Posts'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Preview Section */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Post Preview</CardTitle>
            <CardDescription>
              Preview of all 25 posts in the campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {posts.map((post, idx) => (
                <div key={idx} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Post {post.postNumber}</Badge>
                    <Badge className={
                      post.act === 1 ? 'bg-amber-600' : 
                      post.act === 2 ? 'bg-purple-600' : 
                      'bg-green-600'
                    }>
                      Act {post.act}: {post.actName}
                    </Badge>
                    <Badge variant="secondary">{post.imageUrls.length} images</Badge>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-white/80">{post.content}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {post.imageUrls.slice(0, 4).map((url, i) => (
                      <img 
                        key={i} 
                        src={url} 
                        alt={`Scene ${i + 1}`}
                        className="w-12 h-12 object-cover rounded border border-slate-600"
                      />
                    ))}
                    {post.imageUrls.length > 4 && (
                      <div className="w-12 h-12 rounded border border-slate-600 flex items-center justify-center text-xs text-white/50">
                        +{post.imageUrls.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SocialMediaAdmin;
