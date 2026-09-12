import { getStore, getDeployStore } from '@netlify/blobs';
export function store(name,context){ return context.deploy.context==='production'?getStore({name,consistency:'strong'}):getDeployStore({name,consistency:'strong'}); }
