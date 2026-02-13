import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Users, Heart, AlertCircle, Plus, ArrowLeft } from 'lucide-react';
import { peerSupportService, SupportGroup } from '@/services/peerSupportService';
import { useToast } from '@/hooks/use-toast';

const PeerSupport = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [myGroups, setMyGroups] = useState<SupportGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const profile = await peerSupportService.getPeerProfile();
      setHasProfile(!!profile);

      if (profile) {
        const groups = await peerSupportService.getMyGroups();
        setMyGroups(groups);
      }
    } catch (error) {
      console.error('Error loading peer support data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load peer support data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (hasProfile === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Peer Support</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with others who understand what you're going through. 
              Share experiences, find support, and build meaningful connections.
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Safety First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>All profiles are anonymous</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Moderated by trained volunteers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Crisis detection and support built-in</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Report inappropriate content easily</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Your privacy is protected</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Button 
            size="lg" 
            className="w-full"
            onClick={() => navigate('/peer-support/setup')}
          >
            Create Anonymous Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 pb-24">
      <div className="max-w-4xl mx-auto pt-20">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-6">Peer Support</h1>

        {/* Crisis Alert */}
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>In Crisis?</strong>
              <p className="text-sm">Get immediate professional help</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/wellness')}
            >
              Get Help
            </Button>
          </AlertDescription>
        </Alert>

        {/* My Groups */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Support Groups</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toast({ title: 'Coming Soon', description: 'Group browsing will be available soon!' })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Browse
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {myGroups.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  You haven't joined any groups yet
                </p>
                <Button 
                  variant="outline"
                  onClick={() => toast({ title: 'Coming Soon', description: 'Group browsing will be available soon!' })}
                >
                  Explore Groups
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {myGroups.map(group => (
                  <Card key={group.id} className="cursor-pointer hover:bg-accent transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{group.name}</h3>
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                        </div>
                        <Badge variant="secondary">{group.member_count || 0}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Community Guidelines */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Community Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Be kind and supportive</li>
              <li>• Respect everyone's privacy</li>
              <li>• No medical advice - share experiences only</li>
              <li>• Listen actively and without judgment</li>
              <li>• Report concerning content</li>
            </ul>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{myGroups.length}</div>
                <div className="text-xs text-muted-foreground">Groups Joined</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-xs text-muted-foreground">Buddy Status</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">0</div>
                <div className="text-xs text-muted-foreground">Reputation</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <Button 
            className="w-full" 
            variant="default"
            onClick={() => toast({ title: 'Coming Soon', description: 'Group browsing will be available soon!' })}
          >
            <Users className="mr-2 h-4 w-4" />
            Browse Support Groups
          </Button>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => navigate('/peer-support/setup')}
          >
            Edit My Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PeerSupport;
