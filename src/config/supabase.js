// supabase.js
import { createClient } from '@supabase/supabase-js';

// Reemplazá con tus credenciales de Supabase
const SUPABASE_URL = 'https://gdhlplerlrlpuhpfeiph.supabase.co';
const SECRET_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaGxwbGVybHJscHVocGZlaXBoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzYyMDc1MywiZXhwIjoyMDYzMTk2NzUzfQ.JOr_wH32QJaP_FPPVLBpoWBB1nuVucfuhij-6Evrxfk';

export const supabase = createClient(SUPABASE_URL, SECRET_KEY);