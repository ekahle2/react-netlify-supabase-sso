/**
 * useData — replace this stub with your domain's data hook.
 *
 * This example uses a `notes` table with columns:
 *   id          uuid primary key default gen_random_uuid()
 *   user_id     uuid references auth.users not null
 *   title       text not null
 *   content     text
 *   created_at  timestamptz default now()
 *
 * RLS policy (apply in Supabase SQL editor):
 *   alter table notes enable row level security;
 *   create policy "users own their notes"
 *     on notes for all using (auth.uid() = user_id);
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Map DB row → app object
function fromDB(row) {
  return {
    id:        row.id,
    title:     row.title,
    content:   row.content ?? '',
    createdAt: row.created_at,
  }
}

// Map app object → DB row (for inserts/updates)
function toDB(item) {
  return {
    title:   item.title,
    content: item.content,
  }
}

export function useData() {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('useData load error:', error)
      setError('Failed to load data.')
    } else {
      setItems(data.map(fromDB))
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function addItem(fields) {
    const { data, error } = await supabase
      .from('notes')
      .insert([toDB(fields)])
      .select()
      .single()
    if (error) { console.error('addItem error:', error); return }
    setItems(prev => [fromDB(data), ...prev])
  }

  async function updateItem(id, fields) {
    const { data, error } = await supabase
      .from('notes')
      .update(toDB(fields))
      .eq('id', id)
      .select()
      .single()
    if (error) { console.error('updateItem error:', error); return }
    setItems(prev => prev.map(item => item.id === id ? fromDB(data) : item))
  }

  async function deleteItem(id) {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) { console.error('deleteItem error:', error); return }
    setItems(prev => prev.filter(item => item.id !== id))
  }

  return { items, loading, error, addItem, updateItem, deleteItem, reload: load }
}
