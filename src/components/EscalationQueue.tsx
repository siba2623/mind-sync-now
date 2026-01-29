import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

type AlertRow = {
	id: number
	ts: string
	riskLevel: string
	score: number
	reasons: string[]
	payload: any
	status: string
}

export default function EscalationQueue() {
	const [alerts, setAlerts] = useState<AlertRow[]>([])
	const [loading, setLoading] = useState(false)
	const [pending, setPending] = useState<Record<number, boolean>>({})
	const [msg, setMsg] = useState<string | null>(null)
	const { toast } = useToast()
	const navigate = useNavigate()

	const fetchAlerts = useCallback(async () => {
		setLoading(true)
		try {
			const res = await fetch('http://localhost:3001/alerts', { credentials: 'include' })
			if (res.status === 401) return navigate('/auth')
			const data = await res.json()
			// data: { total, page, limit, items }
			setAlerts(data.items || [])
		} catch (e) {
			console.error('Failed to fetch alerts', e)
			setMsg('Failed to load alerts')
		}
		setLoading(false)
	}, [])

	useEffect(() => { fetchAlerts() }, [fetchAlerts])

	async function acknowledge(id: number) {
		// optimistic update
		setPending(p => ({ ...p, [id]: true }))
		setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a))

		try {
			const res = await fetch(`http://localhost:3001/alerts/${id}/acknowledge`, { method: 'POST', credentials: 'include' })
			if (res.status === 401) return navigate('/auth')
			if (!res.ok) throw new Error(`Status ${res.status}`)
			setMsg('Alert acknowledged')
			toast({ title: 'Acknowledged', description: `Alert ${id} acknowledged` })
		} catch (e) {
			// revert optimistic update
			console.error('Ack failed', e)
			setMsg('Failed to acknowledge alert')
			toast({ title: 'Error', description: 'Failed to acknowledge alert', variant: 'destructive' })
			// refresh list to restore server state
			await fetchAlerts()
		} finally {
			setPending(p => { const copy = { ...p }; delete copy[id]; return copy })
		}
	}

	return (
		<div className="p-4 max-w-3xl mx-auto">
			<h2 className="text-xl font-bold mb-2">Escalation Queue</h2>
			{msg && <div className="mb-2 text-sm text-gray-700">{msg}</div>}
			<div className="mb-4">
				<button onClick={fetchAlerts} className="bg-gray-200 px-3 py-1 rounded mr-2">Refresh</button>
			</div>
			{loading && <div>Loading...</div>}
			{!loading && alerts.length === 0 && <div>No alerts</div>}
			<ul>
				{alerts.map(a => (
					<li key={a.id} className="border p-3 mb-2 rounded-lg bg-white">
						<div className="flex justify-between items-start gap-4">
							<div>
								<div className="text-sm text-gray-600">{new Date(a.ts).toLocaleString()}</div>
								<div className="font-semibold">{a.riskLevel.toUpperCase()} (score: {a.score})</div>
								<div className="text-xs text-gray-700">Reasons: {a.reasons.join(', ') || '—'}</div>
								<div className="text-xs text-gray-500 mt-2">{a.payload?.text || ''}</div>
							</div>
							<div className="flex flex-col items-end">
								<div className="mb-2">Status: <span className="font-medium">{a.status}</span></div>
								{a.status !== 'acknowledged' ? (
									<button
										onClick={() => acknowledge(a.id)}
										disabled={!!pending[a.id]}
										className={`px-3 py-1 rounded ${pending[a.id] ? 'bg-gray-300 text-gray-600' : 'bg-blue-600 text-white'}`}>
										{pending[a.id] ? 'Acknowledging…' : 'Acknowledge'}
									</button>
								) : (
									<div className="text-sm text-green-600">Acknowledged</div>
								)}
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}


