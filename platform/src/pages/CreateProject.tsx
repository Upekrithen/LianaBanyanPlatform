import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { ClanGuildContextualPrompt } from '@/components/TribeGuildContextualPrompt';

interface ImageData {
  id: string;
  url: string;
  caption: string;
}

interface ProductForm {
  id: string;
  name: string;
  description: string;
  details: string;
  productSku: string;
  images: ImageData[];
  productionLevels: ProductionLevel[];
}

interface ProductionLevel {
  id: string;
  levelNumber: number;
  levelName: string;
  unitsCount: number;
  unitPrice: number;
  votesNeeded: number;
}

interface ProjectSection {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  images: ImageData[];
}

export default function CreateProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isClanMember, setIsClanMember] = useState(false);
  const [hasGuildMemberships, setHasGuildMemberships] = useState(false);
  
  // Project form
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
  const [projectSku, setProjectSku] = useState('');
  const [projectImages, setProjectImages] = useState<ImageData[]>([]);
  const [projectTagline, setProjectTagline] = useState('');
  const [projectDomain, setProjectDomain] = useState('');
  const [projectLanguage, setProjectLanguage] = useState('en');

  // Check user's clan and guild status
  useEffect(() => {
    const checkMemberships = async () => {
      if (!user) return;

      // Check clan membership
      const { data: clanData } = await supabase
        .from('clan_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      
      setIsClanMember(!!clanData);

      // Check guild membership
      const { data: guildData } = await supabase
        .from('guild_members')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      
      setHasGuildMemberships(!!guildData);
    };

    checkMemberships();
  }, [user]);
  
  // Auto-detect language from domain
  const detectLanguageFromDomain = (domain: string): string => {
    const lowerDomain = domain.toLowerCase();
    if (lowerDomain.includes('hexislo') || lowerDomain.includes('elsegundosegundo')) {
      return 'es';
    }
    // Add more domain patterns as needed
    return 'en';
  };
  
  const handleDomainChange = (value: string) => {
    setProjectDomain(value);
    setProjectLanguage(detectLanguageFromDomain(value));
  };
  
  // Products form
  const [products, setProducts] = useState<ProductForm[]>([]);
  
  // Project sections
  const [sections, setSections] = useState<ProjectSection[]>([]);

  const addProduct = () => {
    const newProduct: ProductForm = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      details: '',
      productSku: '',
      images: [],
      productionLevels: [
        {
          id: crypto.randomUUID(),
          levelNumber: 1,
          levelName: 'Level 1',
          unitsCount: 100,
          unitPrice: 0,
          votesNeeded: 0,
        },
      ],
    };
    setProducts([...products, newProduct]);
  };

  const addSection = () => {
    const newSection: ProjectSection = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      videoUrl: '',
      images: [],
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId));
  };

  const updateSection = (sectionId: string, field: string, value: string) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, [field]: value } : s
    ));
  };

  const updateSectionImages = (sectionId: string, images: ImageData[]) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, images } : s
    ));
  };

  const removeProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };

  const updateProduct = (productId: string, field: string, value: string) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, [field]: value } : p
    ));
  };

  const updateProductImages = (productId: string, images: ImageData[]) => {
    setProducts(products.map(p =>
      p.id === productId ? { ...p, images } : p
    ));
  };

  const addProductionLevel = (productId: string) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const nextLevel = p.productionLevels.length + 1;
        return {
          ...p,
          productionLevels: [
            ...p.productionLevels,
            {
              id: crypto.randomUUID(),
              levelNumber: nextLevel,
              levelName: `Level ${nextLevel}`,
              unitsCount: 100,
              unitPrice: 0,
              votesNeeded: 0,
            },
          ],
        };
      }
      return p;
    }));
  };

  const removeProductionLevel = (productId: string, levelId: string) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const updatedLevels = p.productionLevels
          .filter(l => l.id !== levelId)
          .map((l, idx) => ({ ...l, levelNumber: idx + 1, levelName: `Level ${idx + 1}` }));
        return { ...p, productionLevels: updatedLevels };
      }
      return p;
    }));
  };

  const updateProductionLevel = (
    productId: string,
    levelId: string,
    field: string,
    value: string | number
  ) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          productionLevels: p.productionLevels.map(l =>
            l.id === levelId ? { ...l, [field]: value } : l
          ),
        };
      }
      return p;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (products.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    // Validate products
    for (const product of products) {
      if (!product.name.trim()) {
        toast.error('All products must have a name');
        return;
      }
      if (product.productionLevels.length === 0) {
        toast.error(`Product "${product.name}" must have at least one production level`);
        return;
      }
    }

    setLoading(true);

    try {
      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectName,
          description: projectDescription,
          detailed_description: projectDetails,
          project_sku: projectSku,
          tagline: projectTagline || null,
          primary_domain: projectDomain || null,
          default_language: projectLanguage,
          owner_id: user?.id,
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Insert project images
      if (projectImages.length > 0) {
        const projectImageRecords = projectImages.map((img, idx) => ({
          project_id: project.id,
          image_url: img.url,
          caption: img.caption,
          sort_order: idx,
        }));

        const { error: imagesError } = await supabase
          .from('project_images')
          .insert(projectImageRecords);

        if (imagesError) throw imagesError;
      }

      // Insert project sections
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        
        const { data: createdSection, error: sectionError } = await supabase
          .from('project_sections')
          .insert({
            project_id: project.id,
            title: section.title,
            description: section.description,
            video_url: section.videoUrl || null,
            sort_order: i,
          })
          .select()
          .single();

        if (sectionError) throw sectionError;

        // Insert section images
        if (section.images.length > 0) {
          const sectionImageRecords = section.images.map((img, idx) => ({
            section_id: createdSection.id,
            image_url: img.url,
            caption: img.caption,
            sort_order: idx,
          }));

          const { error: sectionImagesError } = await supabase
            .from('project_section_images')
            .insert(sectionImageRecords);

          if (sectionImagesError) throw sectionImagesError;
        }
      }

      // Create products
      for (const product of products) {
        const { data: createdProduct, error: productError } = await supabase
          .from('products')
          .insert({
            project_id: project.id,
            name: product.name,
            description: product.description,
            details: product.details,
            product_sku: product.productSku,
          })
          .select()
          .single();

        if (productError) throw productError;

        // Insert product images
        if (product.images.length > 0) {
          const productImageRecords = product.images.map((img, idx) => ({
            product_id: createdProduct.id,
            image_url: img.url,
            caption: img.caption,
            sort_order: idx,
          }));

          const { error: productImagesError } = await supabase
            .from('product_images')
            .insert(productImageRecords);

          if (productImagesError) throw productImagesError;
        }

        // Create production levels
        const levels = product.productionLevels.map(level => ({
          product_id: createdProduct.id,
          level_number: level.levelNumber,
          level_name: level.levelName,
          units_count: level.unitsCount,
          unit_price: level.unitPrice,
          votes_needed: level.votesNeeded,
        }));

        const { error: levelsError } = await supabase
          .from('production_levels')
          .insert(levels);

        if (levelsError) throw levelsError;
      }

      toast.success('Project created successfully!');
      navigate('/admin/project');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/project')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{t('createProjectPage.title')}</h1>
          </div>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? t('createProjectPage.creating') : t('createProjectPage.createProject')}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('createProjectPage.projectDetails')}</CardTitle>
              <CardDescription>{t('createProjectPage.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">{t('createProjectPage.projectName')} *</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder={t('createProjectPage.projectNamePlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-tagline">Tagline</Label>
                <Input
                  id="project-tagline"
                  value={projectTagline}
                  onChange={(e) => setProjectTagline(e.target.value)}
                  placeholder="A memorable tagline for your project"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-domain">Primary Domain</Label>
                <Input
                  id="project-domain"
                  value={projectDomain}
                  onChange={(e) => handleDomainChange(e.target.value)}
                  placeholder="example.com"
                />
                <p className="text-sm text-muted-foreground">
                  Domain auto-detects language (e.g., .com.es → Spanish)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-language">Default Language</Label>
                <select
                  id="project-language"
                  value={projectLanguage}
                  onChange={(e) => setProjectLanguage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
                <p className="text-sm text-muted-foreground">
                  Auto-detected from domain, can be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-description">Short Description</Label>
                <Textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="A brief overview of your project..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-details">Detailed Description</Label>
                <Textarea
                  id="project-details"
                  value={projectDetails}
                  onChange={(e) => setProjectDetails(e.target.value)}
                  placeholder="Full details about your project, goals, and vision..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-sku">Project SKU *</Label>
                <Input
                  id="project-sku"
                  value={projectSku}
                  onChange={(e) => setProjectSku(e.target.value)}
                  placeholder="e.g., PROJ-001"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Unique identifier for blockchain-style intellectual property tracking
                </p>
              </div>

              <Separator className="my-6" />

              <div className="space-y-2">
                <Label>Project Images</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload images to showcase your project (max 10 images)
                </p>
                <ImageUpload
                  images={projectImages}
                  onImagesChange={setProjectImages}
                  maxImages={10}
                />
              </div>
            </CardContent>
          </Card>

          {/* Clan & Guild Contextual Prompt */}
          <ClanGuildContextualPrompt 
            context="project_start"
            isClanMember={isClanMember}
            hasGuildMemberships={hasGuildMemberships}
          />

          {/* Project Sections */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Project Sections</h2>
                <p className="text-sm text-muted-foreground">
                  Add detailed sections with descriptions, videos, and images
                </p>
              </div>
              <Button type="button" onClick={addSection} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>

            {sections.map((section, sectionIndex) => (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Section {sectionIndex + 1}</CardTitle>
                      <CardDescription>Detailed content section</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSection(section.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                      placeholder="How It Works"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={section.description}
                      onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                      placeholder="Detailed explanation of this section..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Video URL (Optional)</Label>
                    <Input
                      value={section.videoUrl}
                      onChange={(e) => updateSection(section.id, 'videoUrl', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Section Images</Label>
                    <ImageUpload
                      images={section.images}
                      onImagesChange={(images) => updateSectionImages(section.id, images)}
                      maxImages={5}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Products */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Products</h2>
              <Button type="button" onClick={addProduct} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {products.map((product, productIndex) => (
              <Card key={product.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Product {productIndex + 1}</CardTitle>
                      <CardDescription>Define your product and its production levels</CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Product Details */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Product Name *</Label>
                      <Input
                        value={product.name}
                        onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                        placeholder="Eco-Friendly Water Bottle"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={product.description}
                        onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                        placeholder="Brief product description..."
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Details</Label>
                      <Textarea
                        value={product.details}
                        onChange={(e) => updateProduct(product.id, 'details', e.target.value)}
                        placeholder="Full product specifications and features..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Product SKU *</Label>
                      <Input
                        value={product.productSku}
                        onChange={(e) => updateProduct(product.id, 'productSku', e.target.value)}
                        placeholder="e.g., PROD-001"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Subordinate to Project SKU for IP ledger tracking
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label>Product Images</Label>
                      <ImageUpload
                        images={product.images}
                        onImagesChange={(images) => updateProductImages(product.id, images)}
                        maxImages={8}
                      />
                    </div>
                  </div>

                  {/* Production Levels */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Production Levels</h3>
                      <Button
                        type="button"
                        onClick={() => addProductionLevel(product.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Level
                      </Button>
                    </div>

                    {product.productionLevels.map((level) => (
                      <div key={level.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Level {level.levelNumber}</h4>
                          {product.productionLevels.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProductionLevel(product.id, level.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Level Name</Label>
                            <Input
                              value={level.levelName}
                              onChange={(e) =>
                                updateProductionLevel(product.id, level.id, 'levelName', e.target.value)
                              }
                              placeholder="Starter Pack"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Units to Produce</Label>
                            <Input
                              type="number"
                              value={level.unitsCount}
                              onChange={(e) =>
                                updateProductionLevel(
                                  product.id,
                                  level.id,
                                  'unitsCount',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              min="1"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Unit Price ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={level.unitPrice}
                              onChange={(e) =>
                                updateProductionLevel(
                                  product.id,
                                  level.id,
                                  'unitPrice',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              min="0"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Votes Needed</Label>
                            <Input
                              type="number"
                              value={level.votesNeeded}
                              onChange={(e) =>
                                updateProductionLevel(
                                  product.id,
                                  level.id,
                                  'votesNeeded',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {products.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No products added yet. Click "Add Product" to get started.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
