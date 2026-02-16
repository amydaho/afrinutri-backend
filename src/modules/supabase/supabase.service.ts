import { Injectable, OnModuleInit } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseClient } from '../../config/supabase.config';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;

  onModuleInit() {
    this.client = createSupabaseClient();
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  async query(table: string) {
    return this.client.from(table);
  }
}
