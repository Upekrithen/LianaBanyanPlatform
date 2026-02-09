import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Eye, Save } from "lucide-react";

export default function LandingPageManager() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [editingPage, setEditingPage] = useState<any>(null);
  const [valueProps, setValueProps] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  // Fetch project
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  // Fetch landing pages
  const { data: landingPages } = useQuery({
    queryKey: ['landing-pages', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_landing_pages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (pageData: any) => {
      const payload = {
        ...pageData,
        value_propositions: valueProps,
        key_features: features,
        testimonials: testimonials,
      };

      if (editingPage?.id) {
        const { error } = await supabase
          .from('project_landing_pages')
          .update(payload)
          .eq('id', editingPage.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('project_landing_pages')
          .insert({ ...payload, project_id: projectId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-pages', projectId] });
      toast.success('Landing page saved successfully');
      setEditingPage(null);
    },
  });

  const handleEdit = (page: any) => {
    setEditingPage(page);
    setValueProps(Array.isArray(page.value_propositions) ? page.value_propositions : []);
    setFeatures(Array.isArray(page.key_features) ? page.key_features : []);
    setTestimonials(Array.isArray(page.testimonials) ? page.testimonials : []);
  };

  const handleNew = () => {
    setEditingPage({
      segment_name: '',
      segment_slug: '',
      hero_title: '',
      hero_subtitle: '',
      mission_statement: '',
      call_to_action_text: 'Join the Journey',
      call_to_action_type: 'vote',
      is_default: false,
      is_active: true,
    });
    setValueProps([]);
    setFeatures([]);
    setTestimonials([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Landing Page Manager</h1>
          <p className="text-muted-foreground">{project?.name}</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Landing Page
        </Button>
      </div>

      {!editingPage ? (
        <div className="grid gap-4">
          {landingPages?.map((page) => (
            <Card key={page.id} className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {page.segment_name}
                      {page.is_default && <Badge>Default</Badge>}
                      {!page.is_active && <Badge variant="secondary">Inactive</Badge>}
                    </CardTitle>
                    <CardDescription>{page.hero_title}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/project-landing/${projectId}/${page.segment_slug}`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => handleEdit(page)}>
                      Edit
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
          {(!landingPages || landingPages.length === 0) && (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No landing pages yet. Create one to get started!
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPage.id ? `Edit: ${editingPage.segment_name}` : 'New Landing Page'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="values">Value Props</TabsTrigger>
                <TabsTrigger value="social">Social Proof</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-6">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="segment_name">Market Segment Name</Label>
                    <Input
                      id="segment_name"
                      value={editingPage.segment_name}
                      onChange={(e) => setEditingPage({ ...editingPage, segment_name: e.target.value })}
                      placeholder="e.g., Gamers, Educators, Collectors"
                    />
                  </div>
                  <div>
                    <Label htmlFor="segment_slug">URL Slug</Label>
                    <Input
                      id="segment_slug"
                      value={editingPage.segment_slug}
                      onChange={(e) => setEditingPage({ ...editingPage, segment_slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="e.g., gamers, educators"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero_title">Hero Title</Label>
                    <Input
                      id="hero_title"
                      value={editingPage.hero_title}
                      onChange={(e) => setEditingPage({ ...editingPage, hero_title: e.target.value })}
                      placeholder="Catchy, inspirational title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                    <Textarea
                      id="hero_subtitle"
                      value={editingPage.hero_subtitle || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, hero_subtitle: e.target.value })}
                      placeholder="Supporting text"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hero_image_url">Hero Image URL</Label>
                    <Input
                      id="hero_image_url"
                      value={editingPage.hero_image_url || ''}
                      onChange={(e) => setEditingPage({ ...editingPage, hero_image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_default"
                        checked={editingPage.is_default}
                        onCheckedChange={(checked) => setEditingPage({ ...editingPage, is_default: checked })}
                      />
                      <Label htmlFor="is_default">Default Landing Page</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={editingPage.is_active}
                        onCheckedChange={(checked) => setEditingPage({ ...editingPage, is_active: checked })}
                      />
                      <Label htmlFor="is_active">Active</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="mission_statement">Mission Statement</Label>
                  <Textarea
                    id="mission_statement"
                    value={editingPage.mission_statement || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, mission_statement: e.target.value })}
                    rows={4}
                    placeholder="Inspirational mission statement"
                  />
                </div>
                <div>
                  <Label htmlFor="cta_text">Call to Action Text</Label>
                  <Input
                    id="cta_text"
                    value={editingPage.call_to_action_text}
                    onChange={(e) => setEditingPage({ ...editingPage, call_to_action_text: e.target.value })}
                  />
                </div>
              </TabsContent>

              <TabsContent value="values" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Value Propositions</Label>
                    <Button
                      size="sm"
                      onClick={() => setValueProps([...valueProps, { title: '', description: '' }])}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Value Prop
                    </Button>
                  </div>
                  {valueProps.map((prop, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setValueProps(valueProps.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Title"
                          value={prop.title}
                          onChange={(e) => {
                            const updated = [...valueProps];
                            updated[index].title = e.target.value;
                            setValueProps(updated);
                          }}
                        />
                        <Textarea
                          placeholder="Description"
                          value={prop.description}
                          onChange={(e) => {
                            const updated = [...valueProps];
                            updated[index].description = e.target.value;
                            setValueProps(updated);
                          }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <Label>Key Features</Label>
                    <Button
                      size="sm"
                      onClick={() => setFeatures([...features, { title: '', description: '' }])}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                  {features.map((feature, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setFeatures(features.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Feature title"
                          value={feature.title}
                          onChange={(e) => {
                            const updated = [...features];
                            updated[index].title = e.target.value;
                            setFeatures(updated);
                          }}
                        />
                        <Input
                          placeholder="Description (optional)"
                          value={feature.description || ''}
                          onChange={(e) => {
                            const updated = [...features];
                            updated[index].description = e.target.value;
                            setFeatures(updated);
                          }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="social" className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <Label>Testimonials</Label>
                  <Button
                    size="sm"
                    onClick={() => setTestimonials([...testimonials, { quote: '', author: '', role: '' }])}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Testimonial
                  </Button>
                </div>
                {testimonials.map((testimonial, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setTestimonials(testimonials.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Quote"
                        value={testimonial.quote}
                        onChange={(e) => {
                          const updated = [...testimonials];
                          updated[index].quote = e.target.value;
                          setTestimonials(updated);
                        }}
                      />
                      <Input
                        placeholder="Author name"
                        value={testimonial.author}
                        onChange={(e) => {
                          const updated = [...testimonials];
                          updated[index].author = e.target.value;
                          setTestimonials(updated);
                        }}
                      />
                      <Input
                        placeholder="Role/Title (optional)"
                        value={testimonial.role || ''}
                        onChange={(e) => {
                          const updated = [...testimonials];
                          updated[index].role = e.target.value;
                          setTestimonials(updated);
                        }}
                      />
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 mt-6">
              <Button onClick={() => saveMutation.mutate(editingPage)}>
                <Save className="mr-2 h-4 w-4" />
                Save Landing Page
              </Button>
              <Button variant="outline" onClick={() => setEditingPage(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}