import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonSelect, IonSelectOption, IonChip, IonIcon, IonText, IonCheckbox, useIonToast } from '@ionic/react';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { peerSupportService } from '@/services/peerSupportService';
import { useHistory } from 'react-router-dom';

const AVATAR_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

const CONDITION_OPTIONS = [
  'Depression',
  'Anxiety',
  'Bipolar Disorder',
  'PTSD',
  'OCD',
  'Panic Disorder',
  'Social Anxiety',
  'Eating Disorder',
  'ADHD',
  'Borderline Personality Disorder',
  'Schizophrenia',
  'Substance Use Disorder',
  'Other',
];

const PeerProfileSetup: React.FC = () => {
  const history = useHistory();
  const [present] = useIonToast();
  
  const [displayName, setDisplayName] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [bio, setBio] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConditionToggle = (condition: string) => {
    if (conditions.includes(condition)) {
      setConditions(conditions.filter(c => c !== condition));
    } else {
      setConditions([...conditions, condition]);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!displayName.trim()) {
      present({
        message: 'Please enter a display name',
        duration: 2000,
        color: 'warning'
      });
      return;
    }

    if (displayName.length < 2 || displayName.length > 30) {
      present({
        message: 'Display name must be 2-30 characters',
        duration: 2000,
        color: 'warning'
      });
      return;
    }

    if (conditions.length === 0) {
      present({
        message: 'Please select at least one condition',
        duration: 2000,
        color: 'warning'
      });
      return;
    }

    if (!agreedToTerms) {
      present({
        message: 'Please agree to the community guidelines',
        duration: 2000,
        color: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      
      await peerSupportService.createPeerProfile({
        display_name: displayName.trim(),
        avatar_color: avatarColor,
        bio: bio.trim() || undefined,
        conditions
      });

      present({
        message: 'Profile created successfully!',
        duration: 2000,
        color: 'success',
        icon: checkmarkCircleOutline
      });

      history.push('/peer-support');
    } catch (error: any) {
      console.error('Error creating profile:', error);
      present({
        message: error.message || 'Failed to create profile',
        duration: 3000,
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Create Anonymous Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardContent>
            <IonText color="medium">
              <p>
                Your peer support profile is completely anonymous. Choose a display name 
                that doesn't reveal your identity.
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>

        {/* Display Name */}
        <IonCard>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Display Name *</IonLabel>
              <IonInput
                value={displayName}
                onIonInput={(e) => setDisplayName(e.detail.value || '')}
                placeholder="e.g., HopefulJourney, QuietStrength"
                maxlength={30}
              />
            </IonItem>
            <IonText color="medium">
              <p style={{ fontSize: '12px', marginTop: '5px' }}>
                {displayName.length}/30 characters
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>

        {/* Avatar Color */}
        <IonCard>
          <IonCardContent>
            <IonLabel>Avatar Color *</IonLabel>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
              {AVATAR_COLORS.map(color => (
                <div
                  key={color}
                  onClick={() => setAvatarColor(color)}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: avatarColor === color ? '3px solid #000' : '2px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {avatarColor === color && (
                    <IonIcon icon={checkmarkCircleOutline} style={{ color: 'white', fontSize: '24px' }} />
                  )}
                </div>
              ))}
            </div>
          </IonCardContent>
        </IonCard>

        {/* Bio */}
        <IonCard>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Bio (Optional)</IonLabel>
              <IonTextarea
                value={bio}
                onIonInput={(e) => setBio(e.detail.value || '')}
                placeholder="Share a bit about your journey..."
                maxlength={200}
                rows={3}
              />
            </IonItem>
            <IonText color="medium">
              <p style={{ fontSize: '12px', marginTop: '5px' }}>
                {bio.length}/200 characters
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>

        {/* Conditions */}
        <IonCard>
          <IonCardContent>
            <IonLabel>Mental Health Conditions *</IonLabel>
            <IonText color="medium">
              <p style={{ fontSize: '12px', marginTop: '5px', marginBottom: '10px' }}>
                Select the conditions you're comfortable discussing. This helps us connect you with relevant support groups.
              </p>
            </IonText>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
              {CONDITION_OPTIONS.map(condition => (
                <IonChip
                  key={condition}
                  onClick={() => handleConditionToggle(condition)}
                  color={conditions.includes(condition) ? 'primary' : 'medium'}
                  style={{ cursor: 'pointer' }}
                >
                  {condition}
                  {conditions.includes(condition) && (
                    <IonIcon icon={checkmarkCircleOutline} />
                  )}
                </IonChip>
              ))}
            </div>
          </IonCardContent>
        </IonCard>

        {/* Terms Agreement */}
        <IonCard>
          <IonCardContent>
            <IonItem lines="none">
              <IonCheckbox
                slot="start"
                checked={agreedToTerms}
                onIonChange={(e) => setAgreedToTerms(e.detail.checked)}
              />
              <IonLabel className="ion-text-wrap">
                <p style={{ fontSize: '14px' }}>
                  I agree to the community guidelines: be respectful, protect privacy, 
                  no medical advice, and report concerning content. I understand this is 
                  peer support, not professional therapy.
                </p>
              </IonLabel>
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Submit Button */}
        <IonButton
          expand="block"
          onClick={handleSubmit}
          disabled={loading || !displayName || conditions.length === 0 || !agreedToTerms}
          style={{ marginTop: '20px' }}
        >
          {loading ? 'Creating Profile...' : 'Create Profile'}
        </IonButton>

        <IonButton
          expand="block"
          fill="clear"
          onClick={() => history.goBack()}
          disabled={loading}
        >
          Cancel
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default PeerProfileSetup;
