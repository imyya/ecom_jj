"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createProduct,
  deleteUploadedImage,
  generateCloudinarySignature,
} from "@/features/product/actions";
import type { CategoryListItem } from "@/features/category/queries";
import { Images } from "lucide-react";

type VariantRow = {
  id: string;
  sku: string;
  color: string;
  size: string;
  stock: number;
  priceOverride?: number;
};

type ImageRow = {
  id: string;
  url: string;
  altText: string;
  publicId:string
};

type FlattenedErrors = {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
};

const emptyVariant = (): VariantRow => ({
  id: crypto.randomUUID(),
  sku: "",
  color: "",
  size: "",
  stock: 0,
  priceOverride: undefined,
});

const emptyImage = (): ImageRow => ({
  id: crypto.randomUUID(),
  url: "",
  altText: "",
  publicId:""
});

export function ProductForm({
  categories,
}: {
  categories: CategoryListItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FlattenedErrors | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [basePrice, setBasePrice] = useState<number>(0);
  const [promoPrice, setPromoPrice] = useState<number | undefined>(undefined);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [variants, setVariants] = useState<VariantRow[]>([emptyVariant()]);
  const [images, setImages] = useState<ImageRow[]>([emptyImage()]);

  const updateVariant = (
    id: string,
    field: keyof Omit<VariantRow, "id">,
    value: string | number | undefined,
  ) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  const updateImage = (
    id: string,
    field: keyof Omit<ImageRow, "id">,
    value: string,
  ) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, [field]: value } : img)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);

    const payload = {
      name,
      description: description || undefined,
      categoryId,
      basePrice,
      promoPrice,
      isActive,
      isFeatured,
      isNew,
      isBestSeller,
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      variants: variants.map(({ id, ...v }) => v),
      images: images
        .filter((img) => img.url.trim())
        .map(({id, ...img},index)=> ({...img,position:index})) //retire le id et laisse les autre propriete et ajoute la position qui est egal a l'index
       // .map(({ id, ...img }) => img),
    };

    startTransition(async () => {
      const result = await createProduct(payload);
        if (!result.ok){
          setErrors (result.errors ?? { formErrors: ["Erreur inconnue"], fieldErrors: {} })
          return
      }
      router.push("/admin/product");
    });
  };

  const handleFileUpload = async (file: File, imageId: string) => {
    try{

      const { signature, timestamp, apiKey, cloudName, folder } = await generateCloudinarySignature();
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey!);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);
  
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json()
      console.log(data.public_id, data.asset_folder);

      if(!res.ok) {
        setErrors({formErrors:[data.error.message], fieldErrors:{}})
        return
      }
      //ici secure_url qui vient de cloudinary sert jsute a afficher limage 
      //mais public_id de cloudinary est le id de limage chez cloudinary
      updateImage(imageId, "url", data.secure_url);
      updateImage(imageId,"publicId",data.public_id)
    }catch(err){
      console.error("Error uploading image", err)

    }

  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errors && (
        <div className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errors.formErrors.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
          {Object.entries(errors.fieldErrors).map(([field, msgs]) =>
            msgs?.length ? (
              <p key={field}>
                {field}: {msgs.join(", ")}
              </p>
            ) : null,
          )}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Informations générales
        </h2>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Nom du produit
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-sm border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-sm border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Catégorie
          </label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-sm border border-neutral-300 px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Prix normal (FCFA)
            </label>
            <input
              type="number"
              required
              min={0}
              value={basePrice}
              onChange={(e) => setBasePrice(Number(e.target.value))}
              className="w-full rounded-sm border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Prix promo (FCFA)
            </label>
            <input
              type="number"
              min={0}
              value={promoPrice ?? ""}
              onChange={(e) =>
                setPromoPrice(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              className="w-full rounded-sm border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-neutral-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Actif
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            Mis en avant
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isNew}
              onChange={(e) => setIsNew(e.target.checked)}
            />
            Nouveau
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isBestSeller}
              onChange={(e) => setIsBestSeller(e.target.checked)}
            />
            Meilleure vente
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Titre SEO
          </label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            className="w-full rounded-sm border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Description SEO
          </label>
          <textarea
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            rows={2}
            className="w-full rounded-sm border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Variantes</h2>
          <button
            type="button"
            onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
            className="rounded-sm border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            Ajouter une variante
          </button>
        </div>

        {variants.map((v) => (
          <div
            key={v.id}
            className="flex flex-wrap items-end gap-3 rounded-sm border border-neutral-200 p-3"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">
                SKU
              </label>
              <input
                type="text"
                required
                value={v.sku}
                onChange={(e) => updateVariant(v.id, "sku", e.target.value)}
                className="w-32 rounded-sm border border-neutral-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">
                Couleur
              </label>
              <input
                type="text"
                value={v.color}
                onChange={(e) => updateVariant(v.id, "color", e.target.value)}
                className="w-28 rounded-sm border border-neutral-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">
                Taille
              </label>
              <input
                type="text"
                value={v.size}
                onChange={(e) => updateVariant(v.id, "size", e.target.value)}
                className="w-24 rounded-sm border border-neutral-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">
                Stock
              </label>
              <input
                type="number"
                required
                min={0}
                value={v.stock}
                onChange={(e) =>
                  updateVariant(v.id, "stock", Number(e.target.value))
                }
                className="w-24 rounded-sm border border-neutral-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">
                Prix spécifique
              </label>
              <input
                type="number"
                min={0}
                value={v.priceOverride ?? ""}
                onChange={(e) =>
                  updateVariant(
                    v.id,
                    "priceOverride",
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className="w-28 rounded-sm border border-neutral-300 px-2 py-1.5 text-sm"
              />
            </div>
            <button
              type="button"
              disabled={variants.length === 1}
              onClick={() =>
                setVariants((prev) => prev.filter((row) => row.id !== v.id))
              }
              className="rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-30"
            >
              Supprimer
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Images</h2>
          <button
            type="button"
            onClick={() => setImages((prev) => [...prev, emptyImage()])}
            className="rounded-sm border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 cursor-pointer"
          >
            Ajouter une image
          </button>
        </div>

        {images.map((img) => (
          <div
            key={img.id}
            className="flex flex-wrap items-end gap-3 rounded-sm border border-neutral-200 p-3"
          >
            <div className="flex-1">
              {/* <label className="mb-1 block text-xs font-medium text-neutral-500">
                URL
              </label> */}
              <input
                type="file"
                //value={img.url}
                onChange={(e) =>  {
                  const file = e.target.files?.[0]
                  if(file) handleFileUpload(file,img.id,)
                 
                  
                    }
                }
                className="w-full rounded-sm border border-neutral-300 px-2 py-1.5 text-sm cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-neutral-500">
                Texte alternatif
              </label>
              <input
                type="text"
                value={img.altText}
                onChange={(e) => updateImage(img.id, "altText", e.target.value)}
                className="w-full rounded-sm border border-neutral-300 px-2 py-1.5 text-sm"
              />
            </div>
            <button
              type="button"
              disabled={images.length === 1}
              onClick={() =>
                {

                  const immg = images.find((im)=>im.id==img.id)
                  if(immg) {

                    deleteUploadedImage(immg.publicId)
                  }
                setImages((prev) => prev.filter((row) => row.id !== img.id))}
              }
              className="rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-30"
            >
              Supprimer
            </button>
          </div>
        ))}
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-sm bg-primary px-4 py-2 text-sm font-bold text-slate-50 hover:bg-primary-hover disabled:opacity-50"
      >
        {isPending ? "Création..." : "Créer le produit"}
      </button>
    </form>
  );
}
