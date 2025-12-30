/*
  # Custom Jewellery Orders System

  1. New Tables
    - `custom_jewellery_orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `jewellery_type` (text) - Type of jewellery (ring, necklace, bracelet, etc.)
      - `material` (text) - Preferred material (gold, silver, platinum, etc.)
      - `budget` (numeric) - Customer's budget
      - `description` (text) - Detailed description/notes
      - `required_date` (date) - When customer needs it
      - `design_file_path` (text) - Path to uploaded design file
      - `design_file_name` (text) - Original filename
      - `status` (text) - Order status: requested, approved, in_production, completed, rejected
      - `manager_comment` (text) - Manager's feedback
      - `manager_id` (uuid) - Manager who processed the order
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `custom_jewellery_orders` table
    - Policy: Customers can view and create their own orders
    - Policy: Customers can update their own pending orders
    - Policy: Managers can view all orders
    - Policy: Managers can update order status and add comments
*/

-- Create custom_jewellery_orders table
CREATE TABLE IF NOT EXISTS custom_jewellery_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  jewellery_type text NOT NULL,
  material text NOT NULL,
  budget numeric NOT NULL CHECK (budget > 0),
  description text NOT NULL,
  required_date date NOT NULL,
  design_file_path text,
  design_file_name text,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'in_production', 'completed', 'rejected')),
  manager_comment text,
  manager_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE custom_jewellery_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON custom_jewellery_orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can create their own orders
CREATE POLICY "Users can create own orders"
  ON custom_jewellery_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pending orders
CREATE POLICY "Users can update own pending orders"
  ON custom_jewellery_orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'requested')
  WITH CHECK (auth.uid() = user_id AND status = 'requested');

-- Policy: Managers can view all orders
CREATE POLICY "Managers can view all orders"
  ON custom_jewellery_orders
  FOR SELECT
  TO authenticated
  USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'manager'
  );

-- Policy: Managers can update any order
CREATE POLICY "Managers can update orders"
  ON custom_jewellery_orders
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'manager'
  )
  WITH CHECK (
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'manager'
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON custom_jewellery_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON custom_jewellery_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON custom_jewellery_orders(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_jewellery_orders_updated_at
  BEFORE UPDATE ON custom_jewellery_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();