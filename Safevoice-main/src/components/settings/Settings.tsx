import { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Shield, Bell, Globe, Eye, Smartphone, Save, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoice } from "@/contexts/VoiceContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface UserSettings {
  profile: {
    name: string;
    email: string;
    phone: string;
    emergencyContact: string;
    profileImage?: string;
  };
  privacy: {
    locationTracking: boolean;
    dataSharing: boolean;
    anonymousReporting: boolean;
    profileVisibility: 'public' | 'community' | 'private';
  };
  notifications: {
    emergencyAlerts: boolean;
    communityUpdates: boolean;
    supportGroupReminders: boolean;
    safetyTips: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  accessibility: {
    voiceAssistance: boolean;
    highContrast: boolean;
    largeText: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    biometricLogin: boolean;
    sessionTimeout: number; // minutes
    deviceTrust: boolean;
    autoLock: boolean;
  };
}

export const Settings = () => {
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      name: '',
      email: '',
      phone: '',
      emergencyContact: ''
    },
    privacy: {
      locationTracking: true,
      dataSharing: false,
      anonymousReporting: true,
      profileVisibility: 'community'
    },
    notifications: {
      emergencyAlerts: true,
      communityUpdates: true,
      supportGroupReminders: true,
      safetyTips: true,
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true
    },
    accessibility: {
      voiceAssistance: false,
      highContrast: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: false
    },
    security: {
      twoFactorAuth: false,
      biometricLogin: false,
      sessionTimeout: 30,
      deviceTrust: true,
      autoLock: true
    }
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const { user } = useAuth();
  const { currentLanguage, setLanguage } = useLanguage();
  const { isVoiceEnabled, toggleVoice } = useVoice();
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from localStorage or use defaults
    const savedSettings = localStorage.getItem('safevoice_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({ ...prev, ...parsed }));
    }

    // Initialize with user data if available
    if (user) {
      setSettings(prev => ({
        ...prev,
        profile: {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          emergencyContact: prev.profile.emergencyContact
        }
      }));
    }
  }, [user]);

  const updateSetting = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = async () => {
    localStorage.setItem('safevoice_settings', JSON.stringify(settings));
    
    // Update user profile if changed
    if (user && (
      user.name !== settings.profile.name ||
      user.email !== settings.profile.email ||
      user.phone !== settings.profile.phone
    )) {
      try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            name: settings.profile.name,
            email: settings.profile.email,
            phone: settings.profile.phone
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update profile');
        }

        const updatedUser = await response.json();
        // Update the user in local storage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setHasUnsavedChanges(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
          variant: "default"
        });
      } catch (error) {
        console.error('Profile update error:', error);
        toast({
          title: "Update failed",
          description: error.message || "Failed to update profile. Please try again.",
          variant: "destructive"
        });
        return; // Don't proceed with saving other settings if profile update failed
      }
    }

    setHasUnsavedChanges(false);
    
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully",
      variant: "default"
    });
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      const defaultSettings: UserSettings = {
        profile: {
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          emergencyContact: ''
        },
        privacy: {
          locationTracking: true,
          dataSharing: false,
          anonymousReporting: true,
          profileVisibility: 'community'
        },
        notifications: {
          emergencyAlerts: true,
          communityUpdates: true,
          supportGroupReminders: true,
          safetyTips: true,
          emailNotifications: true,
          smsNotifications: true,
          pushNotifications: true
        },
        accessibility: {
          voiceAssistance: false,
          highContrast: false,
          largeText: false,
          screenReader: false,
          keyboardNavigation: false
        },
        security: {
          twoFactorAuth: false,
          biometricLogin: false,
          sessionTimeout: 30,
          deviceTrust: true,
          autoLock: true
        }
      };

      setSettings(defaultSettings);
      localStorage.removeItem('safevoice_settings');
      setHasUnsavedChanges(true);
      
      toast({
        title: "Settings reset",
        description: "All settings have been reset to default values",
        variant: "default"
      });
    }
  };

  const deleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, this would call an API to delete the account
      localStorage.removeItem('safevoice_current_user');
      localStorage.removeItem('safevoice_settings');
      localStorage.removeItem('safevoice_reports');
      localStorage.removeItem('safevoice_evidence');
      localStorage.removeItem('safevoice_consultations');
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
        variant: "destructive"
      });
      
      // Redirect to auth page
      window.location.href = '/auth';
    }
  };

  return (
    <div className="w-[95%] ml-[2%] space-y-6" style={{width: '95%'}}>
      {/* Header */}
      <div className="mt-6 mb-6">
        <div className="rounded-lg border border-primary bg-primary/10 px-6 py-4 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Customize your SafeVoice AI experience and privacy settings
          </p>
        </div>
      </div>

      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">You have unsaved changes</span>
              </div>
              <Button onClick={saveSettings} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and emergency contacts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={settings.profile.name}
                    onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency">Emergency Contact</Label>
                  <Input
                    id="emergency"
                    type="tel"
                    placeholder="Emergency contact number"
                    value={settings.profile.emergencyContact}
                    onChange={(e) => updateSetting('profile', 'emergencyContact', e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <Select value={currentLanguage} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="af">Afrikaans</SelectItem>
                    <SelectItem value="zu">isiZulu</SelectItem>
                    <SelectItem value="xh">isiXhosa</SelectItem>
                    <SelectItem value="st">Sesotho</SelectItem>
                    <SelectItem value="tn">Setswana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data
              </CardTitle>
              <CardDescription>
                Control how your data is used and shared
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Location Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow location tracking for safety features and emergency services
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.locationTracking}
                  onCheckedChange={(checked) => updateSetting('privacy', 'locationTracking', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Anonymous Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Share anonymous data to improve safety analytics and community insights
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.dataSharing}
                  onCheckedChange={(checked) => updateSetting('privacy', 'dataSharing', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Anonymous Reporting</Label>
                  <p className="text-sm text-muted-foreground">
                    Always submit incident reports anonymously by default
                  </p>
                </div>
                <Switch
                  checked={settings.privacy.anonymousReporting}
                  onCheckedChange={(checked) => updateSetting('privacy', 'anonymousReporting', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select 
                  value={settings.privacy.profileVisibility} 
                  onValueChange={(value) => updateSetting('privacy', 'profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Visible to everyone</SelectItem>
                    <SelectItem value="community">Community - Visible to SafeVoice community</SelectItem>
                    <SelectItem value="private">Private - Not visible to others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose which notifications you'd like to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Alert Types</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Emergency Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Critical safety alerts in your area
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.emergencyAlerts}
                      onCheckedChange={(checked) => updateSetting('notifications', 'emergencyAlerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Community Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        New posts and activities in your community
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.communityUpdates}
                      onCheckedChange={(checked) => updateSetting('notifications', 'communityUpdates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Support Group Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Reminders for upcoming support group meetings
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.supportGroupReminders}
                      onCheckedChange={(checked) => updateSetting('notifications', 'supportGroupReminders', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Safety Tips</Label>
                      <p className="text-sm text-muted-foreground">
                        Daily safety tips and educational content
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.safetyTips}
                      onCheckedChange={(checked) => updateSetting('notifications', 'safetyTips', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Delivery Methods</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Email Notifications</Label>
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>SMS Notifications</Label>
                    <Switch
                      checked={settings.notifications.smsNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Push Notifications</Label>
                    <Switch
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Accessibility Options
              </CardTitle>
              <CardDescription>
                Customize the interface for better accessibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Voice Assistance</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable voice guidance and audio feedback
                  </p>
                </div>
                <Switch
                  checked={isVoiceEnabled}
                  onCheckedChange={toggleVoice}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>High Contrast Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Increase contrast for better visibility
                  </p>
                </div>
                <Switch
                  checked={settings.accessibility.highContrast}
                  onCheckedChange={(checked) => updateSetting('accessibility', 'highContrast', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Large Text</Label>
                  <p className="text-sm text-muted-foreground">
                    Increase text size throughout the application
                  </p>
                </div>
                <Switch
                  checked={settings.accessibility.largeText}
                  onCheckedChange={(checked) => updateSetting('accessibility', 'largeText', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Screen Reader Support</Label>
                  <p className="text-sm text-muted-foreground">
                    Optimize interface for screen readers
                  </p>
                </div>
                <Switch
                  checked={settings.accessibility.screenReader}
                  onCheckedChange={(checked) => updateSetting('accessibility', 'screenReader', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Keyboard Navigation</Label>
                  <p className="text-sm text-muted-foreground">
                    Enhanced keyboard navigation support
                  </p>
                </div>
                <Switch
                  checked={settings.accessibility.keyboardNavigation}
                  onCheckedChange={(checked) => updateSetting('accessibility', 'keyboardNavigation', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and authentication methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Biometric Login</Label>
                  <p className="text-sm text-muted-foreground">
                    Use fingerprint or face recognition to log in
                  </p>
                </div>
                <Switch
                  checked={settings.security.biometricLogin}
                  onCheckedChange={(checked) => updateSetting('security', 'biometricLogin', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-Lock</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically lock the app when inactive
                  </p>
                </div>
                <Switch
                  checked={settings.security.autoLock}
                  onCheckedChange={(checked) => updateSetting('security', 'autoLock', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Session Timeout</Label>
                <Select 
                  value={settings.security.sessionTimeout.toString()} 
                  onValueChange={(value) => updateSetting('security', 'sessionTimeout', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="0">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Trust This Device</Label>
                  <p className="text-sm text-muted-foreground">
                    Remember this device for future logins
                  </p>
                </div>
                <Switch
                  checked={settings.security.deviceTrust}
                  onCheckedChange={(checked) => updateSetting('security', 'deviceTrust', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Reset All Settings</Label>
                  <p className="text-sm text-muted-foreground">
                    Reset all settings to their default values
                  </p>
                </div>
                <Button variant="outline" onClick={resetSettings}>
                  Reset Settings
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Delete Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="destructive" onClick={deleteAccount}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Settings are automatically saved when changed
        </div>
        <Button onClick={saveSettings} disabled={!hasUnsavedChanges}>
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>
      <div className="h-6" />
    </div>
  );
};