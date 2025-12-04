import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSideBar from '../../components/AdminSideBar';
import { apiGetAdminRecipeDetail, apiUpdateAdminRecipe, AdminRecipeUpdateData, apiUploadImage } from '../../api';
import toast from 'react-hot-toast';
import { isLoggedIn, isAdmin } from '../../auth';

const AdminRecipeEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingStepImage, setUploadingStepImage] = useState<number | null>(null);
  const [region, setRegion] = useState<string>('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const stepImageInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [formData, setFormData] = useState<AdminRecipeUpdateData>({
    title: '',
    description: '',
    images: [],
    cookingTimeMinutes: 30,
    difficulty: 'easy',
    servings: 4,
    category: '',
    tags: [],
    ingredients: [],
    steps: [],
    status: 'draft',
  });

  const regions = ['Miền Bắc', 'Miền Trung', 'Miền Nam', 'Tây Nguyên'];

  useEffect(() => {
    if (!isLoggedIn() || !isAdmin()) {
      toast.error('Bạn không có quyền truy cập trang quản trị');
      navigate('/admin/recipes');
      return;
    }

    if (id) {
      loadRecipe();
    }
  }, [id, navigate]);

  const loadRecipe = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const recipe = await apiGetAdminRecipeDetail(id);
      const tags = recipe.tags || [];
      // Tìm vùng miền trong tags
      const foundRegion = regions.find((r) => tags.includes(r)) || '';
      setRegion(foundRegion);
      setFormData({
        title: recipe.title,
        description: recipe.description || '',
        images: recipe.images || [],
        cookingTimeMinutes: recipe.timeMinutes,
        difficulty: recipe.difficulty,
        servings: recipe.servings || 4,
        category: recipe.category,
        tags: tags,
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể tải công thức');
      navigate('/admin/recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      // Thêm vùng miền vào tags nếu có
      const tagsToSubmit = [...(formData.tags || [])];
      if (region && region.trim()) {
        // Xóa vùng miền cũ nếu có
        const regionTags = regions.filter((r) => tagsToSubmit.includes(r));
        regionTags.forEach((tag) => {
          const index = tagsToSubmit.indexOf(tag);
          if (index > -1) tagsToSubmit.splice(index, 1);
        });
        // Thêm vùng miền mới
        if (!tagsToSubmit.includes(region)) {
          tagsToSubmit.push(region);
        }
      } else {
        // Nếu không chọn vùng miền, xóa tất cả vùng miền khỏi tags
        regions.forEach((r) => {
          const index = tagsToSubmit.indexOf(r);
          if (index > -1) tagsToSubmit.splice(index, 1);
        });
      }
      
      await apiUpdateAdminRecipe(id, { ...formData, tags: tagsToSubmit });
      toast.success('Đã cập nhật công thức thành công');
      navigate('/admin/recipes');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể cập nhật công thức');
    } finally {
      setSaving(false);
    }
  };

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...(formData.ingredients || []), { name: '', amount: '', note: '' }],
    });
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...(formData.ingredients || [])];
    newIngredients.splice(index, 1);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleIngredientChange = (index: number, field: string, value: string) => {
    const newIngredients = [...(formData.ingredients || [])];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleAddStep = () => {
    const newSteps = [...(formData.steps || [])];
    newSteps.push({
      order: newSteps.length + 1,
      title: '',
      content: '',
      imageUrl: '',
    });
    setFormData({ ...formData, steps: newSteps });
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = [...(formData.steps || [])];
    newSteps.splice(index, 1);
    // Reorder steps
    newSteps.forEach((step, idx) => {
      step.order = idx + 1;
    });
    setFormData({ ...formData, steps: newSteps });
  };

  const handleStepChange = (index: number, field: string, value: string) => {
    const newSteps = [...(formData.steps || [])];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, steps: newSteps });
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map((t) => t.trim()).filter((t) => t);
    setFormData({ ...formData, tags });
  };

  const handleImagesChange = (value: string) => {
    const images = value.split(',').map((img) => img.trim()).filter((img) => img);
    setFormData({ ...formData, images });
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    try {
      setUploadingImage(true);
      const url = await apiUploadImage(file);
      const currentImages = formData.images || [];
      setFormData({ ...formData, images: [...currentImages, url] });
      toast.success('Đã upload ảnh thành công');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể upload ảnh');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleUploadStepImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    try {
      setUploadingStepImage(index);
      const url = await apiUploadImage(file);
      const newSteps = [...(formData.steps || [])];
      newSteps[index] = { ...newSteps[index], imageUrl: url };
      setFormData({ ...formData, steps: newSteps });
      toast.success('Đã upload ảnh thành công');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể upload ảnh');
    } finally {
      setUploadingStepImage(null);
      const inputRef = stepImageInputRefs.current[index];
      if (inputRef) {
        inputRef.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
        <AdminSideBar />
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="text-center">Đang tải...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
      <AdminSideBar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-text-light dark:text-text-dark text-3xl font-bold">Chỉnh sửa công thức</h1>
            <button
              onClick={() => navigate('/admin/recipes')}
              className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Hủy
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-text-light dark:text-text-dark">Thông tin cơ bản</h2>
              
              <div>
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                    Thời gian nấu (phút) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.cookingTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, cookingTimeMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                    Độ khó *
                  </label>
                  <select
                    required
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                    className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                    Số phần ăn
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || undefined })}
                    className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                    Danh mục *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Vùng miền
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Chọn vùng miền (tùy chọn)</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Tags khác (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.tags?.filter((t) => !regions.includes(t)).join(', ') || ''}
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map((t) => t.trim()).filter((t) => t);
                    // Giữ lại vùng miền nếu có
                    const currentTags = formData.tags || [];
                    const regionTags = currentTags.filter((t) => regions.includes(t));
                    setFormData({ ...formData, tags: [...regionTags, ...tags] });
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Ví dụ: cay, ngọt, chua"
                />
                <p className="mt-1 text-xs text-text-muted-light dark:text-text-muted-dark">
                  Vùng miền sẽ được tự động thêm vào tags
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-2">
                  Ảnh công thức
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImage}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="px-4 py-2 rounded-lg border border-primary text-primary bg-white dark:bg-card-dark hover:bg-primary/5 disabled:opacity-60"
                    >
                      {uploadingImage ? 'Đang upload...' : '+ Upload ảnh từ máy'}
                    </button>
                    <input
                      type="text"
                      placeholder="Hoặc nhập URL ảnh (phân cách bằng dấu phẩy)"
                      value={formData.images?.join(', ') || ''}
                      onChange={(e) => handleImagesChange(e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-border-light dark:border-border-dark"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-light dark:text-text-dark">Nguyên liệu</h2>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90"
                >
                  + Thêm nguyên liệu
                </button>
              </div>

              {formData.ingredients?.map((ing, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Tên nguyên liệu *"
                      required
                      value={ing.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <input
                      type="text"
                      placeholder="Số lượng"
                      value={ing.amount || ''}
                      onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                      className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <input
                      type="text"
                      placeholder="Ghi chú"
                      value={ing.note || ''}
                      onChange={(e) => handleIngredientChange(index, 'note', e.target.value)}
                      className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/70"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-light dark:text-text-dark">Các bước thực hiện</h2>
                <button
                  type="button"
                  onClick={handleAddStep}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90"
                >
                  + Thêm bước
                </button>
              </div>

              {formData.steps?.map((step, index) => (
                <div key={index} className="border border-border-light dark:border-border-dark rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-light dark:text-text-dark">Bước {step.order}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="px-3 py-1 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/70 text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Tiêu đề bước (tùy chọn)"
                    value={step.title || ''}
                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <textarea
                    placeholder="Nội dung bước *"
                    required
                    rows={3}
                    value={step.content}
                    onChange={(e) => handleStepChange(index, 'content', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <div className="flex gap-2">
                    <input
                      ref={(el) => {
                        stepImageInputRefs.current[index] = el;
                      }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadStepImage(index, e)}
                      disabled={uploadingStepImage === index}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => stepImageInputRefs.current[index]?.click()}
                      disabled={uploadingStepImage === index}
                      className="px-3 py-2 rounded-lg border border-primary text-primary bg-white dark:bg-card-dark hover:bg-primary/5 disabled:opacity-60 text-sm whitespace-nowrap"
                    >
                      {uploadingStepImage === index ? 'Đang upload...' : '+ Upload ảnh'}
                    </button>
                    <input
                      type="text"
                      placeholder="Hoặc nhập URL ảnh (tùy chọn)"
                      value={step.imageUrl || ''}
                      onChange={(e) => handleStepChange(index, 'imageUrl', e.target.value)}
                      className="flex-1 px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  {step.imageUrl && (
                    <img
                      src={step.imageUrl}
                      alt={`Step ${step.order}`}
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-border-light dark:border-border-dark"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4 border-t border-border-light dark:border-border-dark">
              <button
                type="button"
                onClick={() => navigate('/admin/recipes')}
                className="px-6 py-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-light dark:text-text-dark hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AdminRecipeEditPage;

