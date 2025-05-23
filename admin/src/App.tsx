import { Toaster } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import Dashboard from './components/Dashboard';
import ArticlesManagement from './components/ArticlesManagement';
import ProcessedArticles from './components/ProcessedArticles';
export default function App() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="articles">All Articles</TabsTrigger>
          <TabsTrigger value="processed">Processed Articles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <Dashboard />
        </TabsContent>
        
        <TabsContent value="articles">
          <ArticlesManagement />
        </TabsContent>
        
        <TabsContent value="processed">
          <ProcessedArticles />
        </TabsContent>
      </Tabs>
      
      <Toaster position="bottom-right" />
    </div>
  );
}
  