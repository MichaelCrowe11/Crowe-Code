-- Optimize Crowe Logic Platform Database Performance
-- Run this after initial schema creation

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_user_updated ON conversations(user_id, updated_at DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_timestamp ON messages(conversation_id, timestamp DESC);

-- Batches indexes
CREATE INDEX IF NOT EXISTS idx_batches_user_id ON batches(user_id);
CREATE INDEX IF NOT EXISTS idx_batches_batch_code ON batches(batch_code);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_batches_species ON batches(species);
CREATE INDEX IF NOT EXISTS idx_batches_created_at ON batches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_batches_user_status ON batches(user_id, status);

-- Strains indexes
CREATE INDEX IF NOT EXISTS idx_strains_scientific_name ON strains(scientific_name);
CREATE INDEX IF NOT EXISTS idx_strains_cultivation_difficulty ON strains(cultivation_difficulty);
CREATE INDEX IF NOT EXISTS idx_strains_edibility ON strains(edibility);
-- GIN index for array searches
CREATE INDEX IF NOT EXISTS idx_strains_common_names ON strains USING GIN(common_names);
CREATE INDEX IF NOT EXISTS idx_strains_substrates ON strains USING GIN(substrates);
CREATE INDEX IF NOT EXISTS idx_strains_medicinal ON strains USING GIN(medicinal_properties);

-- Cultivation protocols indexes
CREATE INDEX IF NOT EXISTS idx_protocols_strain_id ON cultivation_protocols(strain_id);
CREATE INDEX IF NOT EXISTS idx_protocols_technique ON cultivation_protocols(technique);
CREATE INDEX IF NOT EXISTS idx_protocols_difficulty ON cultivation_protocols(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_protocols_verified ON cultivation_protocols(is_verified);

-- Compounds indexes
CREATE INDEX IF NOT EXISTS idx_compounds_name ON compounds(name);
CREATE INDEX IF NOT EXISTS idx_compounds_classification ON compounds(classification);
CREATE INDEX IF NOT EXISTS idx_compounds_research_status ON compounds(research_status);

-- Strain compounds relationship
CREATE INDEX IF NOT EXISTS idx_strain_compounds_strain ON strain_compounds(strain_id);
CREATE INDEX IF NOT EXISTS idx_strain_compounds_compound ON strain_compounds(compound_id);
CREATE INDEX IF NOT EXISTS idx_strain_compounds_both ON strain_compounds(strain_id, compound_id);

-- Research papers indexes
CREATE INDEX IF NOT EXISTS idx_papers_year ON research_papers(year DESC);
CREATE INDEX IF NOT EXISTS idx_papers_journal ON research_papers(journal);
-- GIN indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_papers_title_fts ON research_papers USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_papers_abstract_fts ON research_papers USING GIN(to_tsvector('english', abstract));
CREATE INDEX IF NOT EXISTS idx_papers_keywords ON research_papers USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_papers_species ON research_papers USING GIN(species);
CREATE INDEX IF NOT EXISTS idx_papers_compounds ON research_papers USING GIN(compounds);

-- Lab notebooks indexes
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON lab_notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_notebooks_category ON lab_notebooks(category);
CREATE INDEX IF NOT EXISTS idx_notebooks_private ON lab_notebooks(is_private);
CREATE INDEX IF NOT EXISTS idx_notebooks_updated_at ON lab_notebooks(updated_at DESC);

-- Lab entries indexes
CREATE INDEX IF NOT EXISTS idx_entries_notebook_id ON lab_entries(notebook_id);
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON lab_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_entry_type ON lab_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON lab_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entries_notebook_created ON lab_entries(notebook_id, created_at DESC);
-- Full-text search on content
CREATE INDEX IF NOT EXISTS idx_entries_content_fts ON lab_entries USING GIN(to_tsvector('english', content));

-- AI insights indexes
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_source ON ai_insights(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_insights_type ON ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_insights_priority ON ai_insights(priority);
CREATE INDEX IF NOT EXISTS idx_insights_actionable ON ai_insights(actionable);
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON ai_insights(created_at DESC);

-- Monitoring data indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_monitoring_batch_id ON monitoring_data(batch_id) WHERE batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_monitoring_user_id ON monitoring_data(user_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_timestamp ON monitoring_data(timestamp DESC);

-- Create partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_users_active_subscribers 
  ON users(id, email, subscription_tier) 
  WHERE subscription_status = 'active';

CREATE INDEX IF NOT EXISTS idx_batches_active 
  ON batches(user_id, created_at DESC) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_protocols_verified_public 
  ON cultivation_protocols(strain_id, success_rate DESC) 
  WHERE is_verified = true;

-- Composite indexes for common JOIN operations
CREATE INDEX IF NOT EXISTS idx_messages_join 
  ON messages(conversation_id, user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_entries_join 
  ON lab_entries(notebook_id, user_id, created_at DESC);

-- Statistics update for query planner
ANALYZE users;
ANALYZE conversations;
ANALYZE messages;
ANALYZE batches;
ANALYZE strains;
ANALYZE cultivation_protocols;
ANALYZE compounds;
ANALYZE strain_compounds;
ANALYZE research_papers;
ANALYZE lab_notebooks;
ANALYZE lab_entries;
ANALYZE ai_insights;

-- Function to get index usage statistics
CREATE OR REPLACE FUNCTION get_index_usage_stats()
RETURNS TABLE(
  schemaname text,
  tablename text,
  indexname text,
  index_size text,
  idx_scan bigint,
  idx_tup_read bigint,
  idx_tup_fetch bigint
)
LANGUAGE sql
AS $$
  SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
  FROM pg_stat_user_indexes
  ORDER BY idx_scan DESC;
$$;

-- Function to find missing indexes
CREATE OR REPLACE FUNCTION suggest_missing_indexes()
RETURNS TABLE(
  table_name text,
  column_name text,
  index_type text,
  reason text
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- This is a simplified version. In production, you'd want more sophisticated analysis
  RETURN QUERY
  SELECT 
    t.table_name::text,
    c.column_name::text,
    'btree'::text as index_type,
    'Foreign key without index'::text as reason
  FROM information_schema.table_constraints t
  JOIN information_schema.key_column_usage k 
    ON t.constraint_name = k.constraint_name
  JOIN information_schema.columns c
    ON k.table_name = c.table_name AND k.column_name = c.column_name
  WHERE t.constraint_type = 'FOREIGN KEY'
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes i
    WHERE i.tablename = t.table_name
    AND i.indexdef LIKE '%' || k.column_name || '%'
  );
END;
$$;

-- Add comments for documentation
COMMENT ON INDEX idx_users_email IS 'Fast user lookup by email for authentication';
COMMENT ON INDEX idx_strains_common_names IS 'GIN index for searching strains by common names';
COMMENT ON INDEX idx_papers_title_fts IS 'Full-text search index on research paper titles';
COMMENT ON INDEX idx_entries_content_fts IS 'Full-text search index on lab entry content';