import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonIcon, IonBadge, IonList, IonItem, IonLabel, IonText, IonSpinner } from '@ionic/react';
import { peopleOutline, chatbubblesOutline, heartOutline, alertCircleOutline, addOutline } from 'ionicons/icons';
import { peerSupportService, SupportGroup } from '@/services/peerSupportService';
import { useHistory } from 'react-router-dom';

const PeerSupportHub: React.FC = () => {
  const history = useHistory();
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Peer Support</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (hasProfile === false) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Peer Support</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ textAlign: 'center', marginTop: '20%' }}>
            <IonIcon icon={peopleOutline} style={{ fontSize: '80px', color: '#6366f1' }} />
            <h2>Welcome to Peer Support</h2>
            <p style={{ padding: '0 20px', color: '#666' }}>
              Connect with others who understand what you're going through. 
              Share experiences, find support, and build meaningful connections.
            </p>
            <IonButton 
              expand="block" 
              style={{ margin: '20px' }}
              onClick={() => history.push('/peer-support/setup')}
            >
              Create Anonymous Profile
            </IonButton>
            
            <IonCard style={{ marginTop: '30px', textAlign: 'left' }}>
              <IonCardHeader>
                <IonCardTitle>Safety First</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <ul style={{ paddingLeft: '20px' }}>
                  <li>All profiles are anonymous</li>
                  <li>Moderated by trained volunteers</li>
                  <li>Crisis detection and support</li>
                  <li>Report inappropriate content</li>
                  <li>Your privacy is protected</li>
                </ul>
              </IonCardContent>
            </IonCard>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Peer Support</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {/* Quick Access to Crisis Support */}
        <IonCard color="danger" style={{ marginBottom: '20px' }}>
          <IonCardContent>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <IonIcon icon={alertCircleOutline} style={{ fontSize: '24px', marginRight: '10px' }} />
                <div>
                  <strong>In Crisis?</strong>
                  <p style={{ margin: 0, fontSize: '14px' }}>Get immediate professional help</p>
                </div>
              </div>
              <IonButton size="small" fill="solid" color="light" onClick={() => history.push('/crisis-support')}>
                Get Help
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        {/* My Groups */}
        <IonCard>
          <IonCardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <IonCardTitle>My Support Groups</IonCardTitle>
              <IonButton size="small" fill="clear" onClick={() => history.push('/peer-support/groups')}>
                <IonIcon icon={addOutline} slot="start" />
                Browse
              </IonButton>
            </div>
          </IonCardHeader>
          <IonCardContent>
            {myGroups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <IonIcon icon={chatbubblesOutline} style={{ fontSize: '48px', color: '#ccc' }} />
                <p style={{ color: '#666', marginTop: '10px' }}>
                  You haven't joined any groups yet
                </p>
                <IonButton size="small" onClick={() => history.push('/peer-support/groups')}>
                  Explore Groups
                </IonButton>
              </div>
            ) : (
              <IonList>
                {myGroups.map(group => (
                  <IonItem 
                    key={group.id} 
                    button 
                    onClick={() => history.push(`/peer-support/group/${group.id}`)}
                  >
                    <IonLabel>
                      <h3>{group.name}</h3>
                      <p>{group.description}</p>
                    </IonLabel>
                    <IonBadge slot="end">{group.member_count || 0}</IonBadge>
                  </IonItem>
                ))}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>

        {/* Community Highlights */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={heartOutline} style={{ marginRight: '8px' }} />
              Community Guidelines
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <ul style={{ paddingLeft: '20px', margin: 0 }}>
              <li>Be kind and supportive</li>
              <li>Respect everyone's privacy</li>
              <li>No medical advice - share experiences only</li>
              <li>Listen actively and without judgment</li>
              <li>Report concerning content</li>
            </ul>
          </IonCardContent>
        </IonCard>

        {/* Stats Card */}
        <IonCard>
          <IonCardContent>
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <IonText color="primary">
                  <h2 style={{ margin: 0 }}>{myGroups.length}</h2>
                </IonText>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Groups Joined</p>
              </div>
              <div>
                <IonText color="success">
                  <h2 style={{ margin: 0 }}>0</h2>
                </IonText>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Buddy Status</p>
              </div>
              <div>
                <IonText color="warning">
                  <h2 style={{ margin: 0 }}>0</h2>
                </IonText>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Reputation</p>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Action Buttons */}
        <div style={{ marginTop: '20px' }}>
          <IonButton expand="block" onClick={() => history.push('/peer-support/groups')}>
            <IonIcon icon={peopleOutline} slot="start" />
            Browse Support Groups
          </IonButton>
          <IonButton expand="block" fill="outline" onClick={() => history.push('/peer-support/profile')}>
            Edit My Profile
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PeerSupportHub;
