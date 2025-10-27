'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { volunteerService, Volunteer, CreateVolunteerRequest, UpdateVolunteerRequest } from '@/services/volunteerService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  Save,
  Edit
} from 'lucide-react';

interface VolunteerProfileProps {
  volunteerId?: string;
  isEditing?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function VolunteerProfile({ 
  volunteerId, 
  isEditing: initialIsEditing = false, 
  onSave, 
  onCancel 
}: VolunteerProfileProps) {
  const { user } = useAuth();
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [isNewProfile, setIsNewProfile] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    skills: [] as string[],
    interests: [] as string[],
    preferredMinistries: [] as string[],
    maxHoursPerWeek: '',
    transportationAvailable: false,
    willingToTravel: false,
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    notes: ''
  });

  // Available options
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [availableMinistries, setAvailableMinistries] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newMinistry, setNewMinistry] = useState('');

  useEffect(() => {
    loadVolunteerData();
    loadOptions();
  }, [volunteerId, user]);

  const loadVolunteerData = async () => {
    if (!user?.member?.id && !volunteerId) return;

    try {
      setLoading(true);
      setError(null);

      let volunteerData = null;
      
      try {
        if (volunteerId) {
          const response = await volunteerService.getVolunteerById(volunteerId);
          volunteerData = response.volunteer;
        } else if (user?.member?.id) {
          volunteerData = await volunteerService.getVolunteerByMemberId(user.member.id);
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          // No volunteer profile exists - set up for creation
          setIsNewProfile(true);
          setIsEditing(true);
        } else {
          throw err;
        }
      }

      if (volunteerData) {
        setVolunteer(volunteerData);
        setFormData({
          skills: volunteerData.skills || [],
          interests: volunteerData.interests || [],
          preferredMinistries: volunteerData.preferredMinistries || [],
          maxHoursPerWeek: volunteerData.maxHoursPerWeek?.toString() || '',
          transportationAvailable: volunteerData.transportationAvailable || false,
          willingToTravel: volunteerData.willingToTravel || false,
          emergencyContactName: volunteerData.emergencyContact?.name || '',
          emergencyContactPhone: volunteerData.emergencyContact?.phone || '',
          emergencyContactRelationship: volunteerData.emergencyContact?.relationship || '',
          notes: volunteerData.notes || ''
        });
      }
    } catch (error) {
      console.error('Error loading volunteer data:', error);
      setError('Failed to load volunteer profile');
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [skills, ministries] = await Promise.all([
        volunteerService.getAvailableSkills(),
        volunteerService.getAvailableMinistries()
      ]);
      setAvailableSkills(skills);
      setAvailableMinistries(ministries);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const handleSave = async () => {
    if (!user?.member?.id) return;

    try {
      setSaving(true);
      setError(null);

      const emergencyContact = {
        name: formData.emergencyContactName,
        phone: formData.emergencyContactPhone,
        relationship: formData.emergencyContactRelationship
      };

      if (isNewProfile) {
        const createData: CreateVolunteerRequest = {
          memberId: user.member.id,
          skills: formData.skills,
          interests: formData.interests,
          preferredMinistries: formData.preferredMinistries,
          maxHoursPerWeek: formData.maxHoursPerWeek ? parseInt(formData.maxHoursPerWeek) : undefined,
          transportationAvailable: formData.transportationAvailable,
          willingToTravel: formData.willingToTravel,
          emergencyContact: emergencyContact,
          notes: formData.notes
        };

        const response = await volunteerService.createVolunteer(createData);
        setVolunteer(response.volunteer);
        setIsNewProfile(false);
      } else if (volunteer) {
        const updateData: UpdateVolunteerRequest = {
          skills: formData.skills,
          interests: formData.interests,
          preferredMinistries: formData.preferredMinistries,
          maxHoursPerWeek: formData.maxHoursPerWeek ? parseInt(formData.maxHoursPerWeek) : undefined,
          transportationAvailable: formData.transportationAvailable,
          willingToTravel: formData.willingToTravel,
          emergencyContact: emergencyContact,
          notes: formData.notes
        };

        const response = await volunteerService.updateVolunteer(volunteer.id, updateData);
        setVolunteer(response.volunteer);
      }

      setIsEditing(false);
      onSave?.();
    } catch (error) {
      console.error('Error saving volunteer profile:', error);
      setError('Failed to save volunteer profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isNewProfile) {
      // Reset form for new profile
      setFormData({
        skills: [],
        interests: [],
        preferredMinistries: [],
        maxHoursPerWeek: '',
        transportationAvailable: false,
        willingToTravel: false,
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: '',
        notes: ''
      });
    } else if (volunteer) {
      // Reset form to current volunteer data
      setFormData({
        skills: volunteer.skills || [],
        interests: volunteer.interests || [],
        preferredMinistries: volunteer.preferredMinistries || [],
        maxHoursPerWeek: volunteer.maxHoursPerWeek?.toString() || '',
        transportationAvailable: volunteer.transportationAvailable || false,
        willingToTravel: volunteer.willingToTravel || false,
        emergencyContactName: volunteer.emergencyContact?.name || '',
        emergencyContactPhone: volunteer.emergencyContact?.phone || '',
        emergencyContactRelationship: volunteer.emergencyContact?.relationship || '',
        notes: volunteer.notes || ''
      });
    }
    
    setIsEditing(false);
    onCancel?.();
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addInterest = (interest: string) => {
    if (interest && !formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
    setNewInterest('');
  };

  const removeInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const addMinistry = (ministry: string) => {
    if (ministry && !formData.preferredMinistries.includes(ministry)) {
      setFormData(prev => ({
        ...prev,
        preferredMinistries: [...prev.preferredMinistries, ministry]
      }));
    }
    setNewMinistry('');
  };

  const removeMinistry = (ministry: string) => {
    setFormData(prev => ({
      ...prev,
      preferredMinistries: prev.preferredMinistries.filter(m => m !== ministry)
    }));
  };

  const getBackgroundCheckStatus = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'PENDING':
      case 'IN_PROGRESS':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'REQUIRED':
        return { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'EXPIRED':
      case 'REJECTED':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading volunteer profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {isNewProfile ? 'Create Volunteer Profile' : 
                   volunteer?.member ? 
                   `${volunteer.member.firstName} ${volunteer.member.lastName}` : 
                   'Volunteer Profile'}
                </CardTitle>
                {volunteer?.member && (
                  <div className="space-y-1 text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{volunteer.member.email}</span>
                    </div>
                    {volunteer.member.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{volunteer.member.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {!isNewProfile && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        {volunteer && !isNewProfile && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Hours</p>
                  <p className="font-semibold">{volunteer.totalHours || 0} hrs</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-semibold">
                    {new Date(volunteer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {(() => {
                  const statusInfo = getBackgroundCheckStatus(volunteer.backgroundCheck);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <>
                      <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                      <div>
                        <p className="text-sm text-gray-600">Background Check</p>
                        <Badge className={`${statusInfo.bg} ${statusInfo.color} border-none`}>
                          {volunteer.backgroundCheck.replace('_', ' ')}
                        </Badge>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Skills & Interests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Skills & Interests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Skills */}
          <div>
            <Label className="text-base font-semibold">My Skills</Label>
            <div className="mt-2">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-600" 
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill(newSkill)}
                      className="max-w-xs"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => addSkill(newSkill)}
                      disabled={!newSkill}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableSkills
                      .filter(skill => !formData.skills.includes(skill))
                      .map((skill) => (
                        <Button
                          key={skill}
                          variant="outline"
                          size="sm"
                          onClick={() => addSkill(skill)}
                        >
                          + {skill}
                        </Button>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(volunteer?.skills || []).map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                  {(!volunteer?.skills || volunteer.skills.length === 0) && (
                    <p className="text-gray-500 italic">No skills listed</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Interests */}
          <div>
            <Label className="text-base font-semibold">Areas of Interest</Label>
            <div className="mt-2">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest) => (
                      <Badge key={interest} variant="outline" className="flex items-center gap-1">
                        {interest}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-600" 
                          onClick={() => removeInterest(interest)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an interest..."
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addInterest(newInterest)}
                      className="max-w-xs"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => addInterest(newInterest)}
                      disabled={!newInterest}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(volunteer?.interests || []).map((interest) => (
                    <Badge key={interest} variant="outline">{interest}</Badge>
                  ))}
                  {(!volunteer?.interests || volunteer.interests.length === 0) && (
                    <p className="text-gray-500 italic">No interests listed</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Preferred Ministries */}
          <div>
            <Label className="text-base font-semibold">Preferred Ministries</Label>
            <div className="mt-2">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredMinistries.map((ministry) => (
                      <Badge key={ministry} className="flex items-center gap-1 bg-blue-100 text-blue-800">
                        {ministry}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-600" 
                          onClick={() => removeMinistry(ministry)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableMinistries
                      .filter(ministry => !formData.preferredMinistries.includes(ministry))
                      .map((ministry) => (
                        <Button
                          key={ministry}
                          variant="outline"
                          size="sm"
                          onClick={() => addMinistry(ministry)}
                        >
                          + {ministry}
                        </Button>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(volunteer?.preferredMinistries || []).map((ministry) => (
                    <Badge key={ministry} className="bg-blue-100 text-blue-800">{ministry}</Badge>
                  ))}
                  {(!volunteer?.preferredMinistries || volunteer.preferredMinistries.length === 0) && (
                    <p className="text-gray-500 italic">No ministry preferences set</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability & Logistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Availability & Logistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxHours">Max Hours per Week</Label>
              {isEditing ? (
                <Input
                  id="maxHours"
                  type="number"
                  placeholder="15"
                  value={formData.maxHoursPerWeek}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxHoursPerWeek: e.target.value }))}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 font-medium">
                  {volunteer?.maxHoursPerWeek ? `${volunteer.maxHoursPerWeek} hours` : 'Not specified'}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <Checkbox
                  id="transportation"
                  checked={formData.transportationAvailable}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, transportationAvailable: checked as boolean }))
                  }
                />
              ) : (
                <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                  volunteer?.transportationAvailable ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}>
                  {volunteer?.transportationAvailable && (
                    <CheckCircle className="h-3 w-3 text-white" />
                  )}
                </div>
              )}
              <Label htmlFor="transportation">I have reliable transportation</Label>
            </div>

            <div className="flex items-center space-x-2">
              {isEditing ? (
                <Checkbox
                  id="travel"
                  checked={formData.willingToTravel}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, willingToTravel: checked as boolean }))
                  }
                />
              ) : (
                <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                  volunteer?.willingToTravel ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                }`}>
                  {volunteer?.willingToTravel && (
                    <CheckCircle className="h-3 w-3 text-white" />
                  )}
                </div>
              )}
              <Label htmlFor="travel">I'm willing to travel to other locations</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="emergencyName">Name</Label>
                <Input
                  id="emergencyName"
                  placeholder="Jane Doe"
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Phone</Label>
                <Input
                  id="emergencyPhone"
                  placeholder="(555) 123-4567"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="emergencyRelationship">Relationship</Label>
                <Input
                  id="emergencyRelationship"
                  placeholder="Spouse"
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => setFormData(prev => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
          ) : (
            <div>
              {volunteer?.emergencyContact ? (
                <div className="space-y-1">
                  <p><strong>Name:</strong> {volunteer.emergencyContact.name}</p>
                  <p><strong>Phone:</strong> {volunteer.emergencyContact.phone}</p>
                  <p><strong>Relationship:</strong> {volunteer.emergencyContact.relationship}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No emergency contact information provided</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              placeholder="Additional notes or special considerations..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
            />
          ) : (
            <div>
              {volunteer?.notes ? (
                <p className="whitespace-pre-wrap">{volunteer.notes}</p>
              ) : (
                <p className="text-gray-500 italic">No additional notes</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save/Cancel for new profiles */}
      {isNewProfile && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        </div>
      )}
    </div>
  );
}
