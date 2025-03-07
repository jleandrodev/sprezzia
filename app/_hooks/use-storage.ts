import { createClient } from '@supabase/supabase-js';
import { useCallback, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

type UseStorageOptions = {
  bucket?: string;
  expiresIn?: number;
};

export function useStorage(options: UseStorageOptions = {}) {
  const {
    bucket = 'documents',
    expiresIn = 60 // 1 minuto conforme padrão estabelecido
  } = options;

  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getSupabaseClient = useCallback(async () => {
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) {
        throw new Error('Não foi possível obter o token de autenticação');
      }

      return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
    } catch (err) {
      const error = err as Error;
      console.error('Erro ao criar cliente Supabase:', error);
      throw error;
    }
  }, [getToken]);

  const upload = useCallback(async (file: File, path: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = await getSupabaseClient();
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
        throw uploadError;
      }

      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [bucket, getSupabaseClient]);

  const getSignedUrl = useCallback(async (path: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = await getSupabaseClient();
      const { data, error: signedUrlError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (signedUrlError) {
        console.error('Erro ao gerar URL assinada:', signedUrlError);
        throw signedUrlError;
      }

      return data.signedUrl;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [bucket, expiresIn, getSupabaseClient]);

  const remove = useCallback(async (path: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = await getSupabaseClient();
      const { error: removeError } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (removeError) {
        console.error('Erro ao remover arquivo:', removeError);
        throw removeError;
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [bucket, getSupabaseClient]);

  return {
    upload,
    getSignedUrl,
    remove,
    isLoading,
    error
  };
}
