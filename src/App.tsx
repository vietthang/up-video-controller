import React from 'react'
import { StringParam, useQueryParam } from 'use-query-params'
import './App.css'
import { App as ContentApp } from './content/App'
import { Root } from './controller/Root'
import { App as RendererApp } from './renderer/App'

const App: React.FC = () => {
  const [appName] = useQueryParam('app', StringParam)

  switch (appName) {
    case 'renderer':
      return <RendererApp></RendererApp>
    case 'content':
      return <ContentApp></ContentApp>
    default:
      return <Root></Root>
  }
}

export default App
