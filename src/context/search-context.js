import React from 'react'
import algoliasearch from 'algoliasearch'
import marked from 'marked'
import truncate from 'lodash/truncate'
import { prefixSearchIndex } from '../utilities/algolia'

const initialState = {
  query: '',
  results: {
    states: {},
    blogPosts: {},
    pages: {},
  },
  isFetching: false,
  hasErrors: false,
  errors: [],
}

const client = algoliasearch(
  process.env.GATSBY_ALGOLIA_APP_ID,
  process.env.GATSBY_ALGOLIA_SEARCH_KEY,
)

const stateIndex = client.initIndex(prefixSearchIndex('states'))
const blogIndex = client.initIndex(prefixSearchIndex('blog_posts'))
const pageIndex = client.initIndex(prefixSearchIndex('pages'))

const SearchStateContext = React.createContext()

const SearchDispatchContext = React.createContext()

function searchReducer(state, action) {
  switch (action.type) {
    default:
      throw new Error(`Unknown action type: ${action.type}.`)
    case 'setQuery':
      return {
        ...state,
        query: action.payload,
      }
    case 'fetchStart':
      return {
        ...state,
        isFetching: true,
        hasErrors: false,
        errors: [],
      }
    case 'fetchError':
      return {
        ...state,
        isFetching: false,
        hasErrors: true,
        errors: [...state.errors, action.error],
      }
    case 'fetchSuccess':
      return {
        ...state,
        isFetching: false,
        results: action.payload,
      }
  }
}

export function SearchProvider({ children }) {
  const [state, dispatch] = React.useReducer(searchReducer, initialState)

  return (
    <SearchStateContext.Provider value={state}>
      <SearchDispatchContext.Provider value={dispatch}>
        {children}
      </SearchDispatchContext.Provider>
    </SearchStateContext.Provider>
  )
}

export function useSearchState() {
  const context = React.useContext(SearchStateContext)
  if (context === undefined) {
    throw new Error('useSearchState must be used within a SearchProvider')
  }
  return context
}

export function useSearchDispatch() {
  const context = React.useContext(SearchDispatchContext)
  if (context === undefined) {
    throw new Error('useSearchDispatch must be used within a SearchProvider')
  }
  return context
}

export function useSearch() {
  return [useSearchState(), useSearchDispatch()]
}

async function queryIndex(index, query) {
  try {
    const hits = await index.search(query)
    return hits
  } catch (e) {
    // TODO client-side error reporting?
    console.error(e) // eslint-disable-line
    return []
  }
}

export async function querySearch(state, dispatch) {
  dispatch({ type: 'fetchStart' })
  try {
    const [states, blogPosts, pages] = await Promise.all([
      queryIndex(stateIndex, state.query),
      queryIndex(blogIndex, state.query),
      queryIndex(pageIndex, state.query),
    ])
    dispatch({ type: 'fetchSuccess', payload: { states, blogPosts, pages } })
  } catch (error) {
    dispatch({ type: 'fetchError', error })
  }
}

export function getHighlightResultOrExcerpt(hitType, hit) {
  switch (hitType) {
    default:
      return ''
    case 'page':
      /* eslint-disable no-underscore-dangle */
      return hit._highlightResult.body && hit._highlightResult.body.value
        ? marked(hit._highlightResult.body.value)
        : marked(truncate(hit.body))
    /* eslint-enable no-underscore-dangle */
  }
}

export default {}