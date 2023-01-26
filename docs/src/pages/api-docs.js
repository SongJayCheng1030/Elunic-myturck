import React from 'react';
import Layout from '@theme/Layout';
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import knownApiDocs from '../../known-api-docs';
import BrowserOnly from '@docusaurus/BrowserOnly';

function getUrl() {
  const apiDocsFor = new URL(window.location.href).searchParams.get('api');
  const docs = knownApiDocs.find(p => p.tag === apiDocsFor);
  
  let url = '';
  if (docs) {
    url = docs.url[process.env.NODE_ENV === 'development' ? 'dev' : 'prod'];
  }
  
  if (!url.startsWith('http')) {
    url = new URL(url, window.location.origin).href;
  }
  
  console.log(`Loading API docs from:`, url);

  return url;
}

function render() {
  return (
    <Layout title="Shopfloor API Docs" description="Shopfloor API Docs for Microservices">
      <div
        style={{
          paddingTop: '0px',
        }}>
        
      <SwaggerUI url={getUrl()} />
      </div>
    </Layout>
  );
}

export default function ApiDocs() {
  return (
    <BrowserOnly>
      {render}
    </BrowserOnly>
  );
}