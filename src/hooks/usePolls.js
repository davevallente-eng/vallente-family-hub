import { useCallback, useEffect, useState } from 'react'
import { supabase, supabaseEnabled } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// Polls live in two tables — `polls` (the question + options) and
// `poll_votes` (one row per (poll_id, member_name)). The hook merges them
// into the same shape the UI used in localStorage mode:
//   { id, question, options, askedBy, createdAt, votes: { Dave: 'a', ... } }
//
// Mutations rely on the realtime subscription to refresh state — both
// `polls` and `poll_votes` are watched, so any insert/update/delete from
// any device triggers a re-fetch.
export function usePolls() {
  const { profile } = useAuth()
  const [polls, setPolls] = useState([])

  useEffect(() => {
    if (!supabaseEnabled || !profile) return
    let cancelled = false

    const doFetch = async () => {
      const [{ data: pollRows }, { data: voteRows }] = await Promise.all([
        supabase.from('polls').select('*').order('created_at', { ascending: false }),
        supabase.from('poll_votes').select('*'),
      ])
      if (cancelled) return
      const votesByPoll = {}
      for (const v of voteRows ?? []) {
        votesByPoll[v.poll_id] = votesByPoll[v.poll_id] ?? {}
        votesByPoll[v.poll_id][v.member_name] = v.option_id
      }
      setPolls((pollRows ?? []).map(p => ({
        id: p.id,
        question: p.question,
        options: p.options,
        askedBy: p.asked_by,
        createdAt: p.created_at,
        votes: votesByPoll[p.id] ?? {},
      })))
    }

    doFetch()

    const channel = supabase
      .channel('db-polls')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polls' }, doFetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_votes' }, doFetch)
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [profile])

  const add = useCallback(async ({ question, options, askedBy }) => {
    if (!supabaseEnabled) return null
    const cleaned = options.map(t => t.trim()).filter(Boolean)
    if (!question.trim() || cleaned.length < 2) return null
    const optsArr = cleaned.map((text, i) => ({ id: String.fromCharCode(97 + i), text }))
    const { data, error } = await supabase
      .from('polls')
      .insert({ question: question.trim(), options: optsArr, asked_by: askedBy ?? null })
      .select()
      .single()
    if (error) {
      console.error('[usePolls] insert error', error)
      return null
    }
    return data?.id ?? null
  }, [])

  const remove = useCallback(async (id) => {
    if (!supabaseEnabled) return
    setPolls(prev => prev.filter(p => p.id !== id))
    await supabase.from('polls').delete().eq('id', id)
  }, [])

  const castVote = useCallback(async (pollId, optionId, memberName) => {
    if (!supabaseEnabled || !memberName) return
    const current = polls.find(p => p.id === pollId)?.votes?.[memberName]
    // Optimistic local update — realtime will reconcile.
    setPolls(prev => prev.map(p => {
      if (p.id !== pollId) return p
      const next = { ...p.votes }
      if (current === optionId) delete next[memberName]
      else next[memberName] = optionId
      return { ...p, votes: next }
    }))
    if (current === optionId) {
      await supabase.from('poll_votes')
        .delete()
        .eq('poll_id', pollId)
        .eq('member_name', memberName)
    } else {
      await supabase.from('poll_votes')
        .upsert({ poll_id: pollId, member_name: memberName, option_id: optionId })
    }
  }, [polls])

  return { polls, add, remove, castVote }
}
