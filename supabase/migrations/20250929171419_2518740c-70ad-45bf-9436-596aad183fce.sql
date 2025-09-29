-- Create saved_areas table for area calculations
CREATE TABLE public.saved_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  area NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_areas ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_areas
CREATE POLICY "Users can view their own saved areas" 
ON public.saved_areas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved areas" 
ON public.saved_areas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved areas" 
ON public.saved_areas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved areas" 
ON public.saved_areas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create financial_records table
CREATE TABLE public.financial_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

-- Create policies for financial_records
CREATE POLICY "Users can view their own financial records" 
ON public.financial_records 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own financial records" 
ON public.financial_records 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial records" 
ON public.financial_records 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial records" 
ON public.financial_records 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create favorite_cities table
CREATE TABLE public.favorite_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  city_name TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.favorite_cities ENABLE ROW LEVEL SECURITY;

-- Create policies for favorite_cities
CREATE POLICY "Users can view their own favorite cities" 
ON public.favorite_cities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorite cities" 
ON public.favorite_cities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite cities" 
ON public.favorite_cities 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create routes table
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  distance NUMERIC,
  duration NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Create policies for routes
CREATE POLICY "Users can view their own routes" 
ON public.routes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own routes" 
ON public.routes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routes" 
ON public.routes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routes" 
ON public.routes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function for timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_saved_areas_updated_at
  BEFORE UPDATE ON public.saved_areas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_records_updated_at
  BEFORE UPDATE ON public.financial_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON public.routes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get mapbox token (placeholder for now)
CREATE OR REPLACE FUNCTION public.get_mapbox_token()
RETURNS TEXT AS $$
BEGIN
  -- This is a placeholder function
  -- In production, you would store and retrieve the actual Mapbox token securely
  RETURN 'placeholder_mapbox_token';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;