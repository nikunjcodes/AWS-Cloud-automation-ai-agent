import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Arn {
  _id: string;
  arn: string;
  service: string;
  description: string;
  createdAt: string;
}

export function ArnManager() {
  const [arns, setArns] = useState<Arn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    arn: '',
    service: '',
    description: ''
  });
  const { toast } = useToast();

  // Fetch existing ARNs
  useEffect(() => {
    fetchArns();
  }, []);

  const fetchArns = async () => {
    try {
      const response = await fetch('/api/user/arns');
      if (!response.ok) throw new Error('Failed to fetch ARNs');
      const data = await response.json();
      setArns(data.arns);
    } catch (error) {
      console.error('Error fetching ARNs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch ARNs',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/save-arn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save ARN');
      }

      toast({
        title: 'Success',
        description: 'ARN saved successfully'
      });

      // Reset form and refresh ARNs list
      setFormData({ arn: '', service: '', description: '' });
      fetchArns();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save ARN',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New ARN</CardTitle>
          <CardDescription>Enter AWS Resource Name (ARN) details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="arn">ARN</Label>
              <Input
                id="arn"
                value={formData.arn}
                onChange={(e) => setFormData({ ...formData, arn: e.target.value })}
                placeholder="arn:aws:service:region:account:resource"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Select
                value={formData.service}
                onValueChange={(value) => setFormData({ ...formData, service: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AWS service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ec2">EC2</SelectItem>
                  <SelectItem value="rds">RDS</SelectItem>
                  <SelectItem value="s3">S3</SelectItem>
                  <SelectItem value="iam">IAM</SelectItem>
                  <SelectItem value="lambda">Lambda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save ARN'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved ARNs</CardTitle>
          <CardDescription>Your saved AWS Resource Names</CardDescription>
        </CardHeader>
        <CardContent>
          {arns.length === 0 ? (
            <p className="text-muted-foreground">No ARNs saved yet</p>
          ) : (
            <div className="space-y-4">
              {arns.map((arn) => (
                <div key={arn._id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{arn.service.toUpperCase()}</h4>
                      <p className="text-sm text-muted-foreground">{arn.arn}</p>
                      {arn.description && (
                        <p className="text-sm mt-1">{arn.description}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(arn.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 