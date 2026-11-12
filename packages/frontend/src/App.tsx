import { Routes, Route, Navigate } from 'react-router-dom';
import { WorkflowListPage } from './pages/WorkflowListPage.js';
import { WorkflowEditorPage } from './pages/WorkflowEditorPage.js';
import { CredentialsPage } from './pages/CredentialsPage.js';
import { ExecutionsPage } from './pages/ExecutionsPage.js';
import { Layout } from './components/Layout.js';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/workflows" replace />} />
        <Route path="/workflows" element={<WorkflowListPage />} />
        <Route path="/workflows/:id" element={<WorkflowEditorPage />} />
        <Route path="/credentials" element={<CredentialsPage />} />
        <Route path="/executions" element={<ExecutionsPage />} />
      </Route>
    </Routes>
  );
}
