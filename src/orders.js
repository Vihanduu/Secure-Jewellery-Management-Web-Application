import { supabase } from './supabaseClient.js';

export async function createCustomOrder(orderData) {
  const { data, error } = await supabase
    .from('custom_jewellery_orders')
    .insert([orderData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMyOrders() {
  const { data, error } = await supabase
    .from('custom_jewellery_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from('custom_jewellery_orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllOrders() {
  const { data, error } = await supabase
    .from('custom_jewellery_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPendingOrders() {
  const { data, error } = await supabase
    .from('custom_jewellery_orders')
    .select('*')
    .eq('status', 'requested')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateOrderStatus(orderId, status, managerComment, managerId) {
  const updateData = {
    status,
    manager_comment: managerComment,
    manager_id: managerId,
  };

  const { data, error } = await supabase
    .from('custom_jewellery_orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadDesignFile(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `designs/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('jewellery-designs')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('jewellery-designs')
    .getPublicUrl(filePath);

  return {
    path: filePath,
    url: publicUrl,
    originalName: file.name
  };
}
