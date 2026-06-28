import {useEffect, useState} from 'react'
import {ApiError, type CurrentUser, api} from './api'

type State =
  | {status: 'loading'}
  | {status: 'authenticated'; user: CurrentUser}
  | {status: 'anonymous'}
  | {status: 'error'; message: string}

/** Loads the logged-in user from /api/me/. A 403 means "not signed in". */
export function useCurrentUser(): State {
  const [state, setState] = useState<State>({status: 'loading'})

  useEffect(() => {
    let cancelled = false
    api
      .me()
      .then((user) => {
        if (!cancelled) setState({status: 'authenticated', user})
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && (err.status === 403 || err.status === 401)) {
          setState({status: 'anonymous'})
        } else {
          setState({status: 'error', message: 'Could not reach the server.'})
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
