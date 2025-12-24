import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface InfoRowProps {
    label: string;
    value: string;
    fieldKey: string;
    isEditing: boolean;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onSave: (value: string) => void;
}

const InfoRow = ({ label, value, fieldKey, isEditing, onStartEdit, onCancelEdit, onSave }: InfoRowProps) => {
    const { t } = useTranslation();
    const [editValue, setEditValue] = useState(value);

    // Update editValue when value prop changes or when starting edit
    if (isEditing && editValue !== value && editValue === '') {
        // This is a simplification, ideally we use useEffect, but simple component state reset is fine too
        // handled by key prop in parent or useEffect in real app, but for now:
        // actually let's initialize state when entering edit mode properly in parent or here
    }

    const handleSave = () => {
        onSave(editValue);
    };

    if (isEditing) {
        return (
            <div className="py-6 border-b border-border last:border-0">
                <div className="mb-2">
                    <p className="font-medium mb-1">{label}</p>
                    <p className="text-sm text-muted-foreground mb-4">
                        {t('account.editDesc', 'Update your personal information.')}
                    </p>
                    <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="max-w-md mb-4"
                    />
                    <div className="flex gap-2">
                        <Button onClick={handleSave} className="bg-black text-white hover:bg-black/90">
                            {t('common.save', 'Save')}
                        </Button>
                        <Button variant="ghost" onClick={() => { onCancelEdit(); setEditValue(value); }}>
                            {t('common.cancel', 'Cancel')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Determine action text based on whether value is provided
    // 'Not provided' is a placeholder, if value matches that or is empty, show 'Add', else 'Edit'
    const isProvided = value && value !== t('account.notProvided', 'Not provided');
    const actionText = isProvided ? t('common.edit', 'Edit') : t('account.add', 'Add');

    // For initializing edit value correctly when entering edit mode
    // We can rely on 'value' prop being passed correctly

    return (
        <div className="flex items-center justify-between py-6 border-b border-border last:border-0">
            <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{value}</p>
            </div>
            <Button
                variant="link"
                className="text-primary font-medium"
                onClick={() => {
                    setEditValue(value === t('account.notProvided', 'Not provided') ? '' : value);
                    onStartEdit();
                }}
            >
                {actionText}
            </Button>
        </div>
    );
};

const PersonalInfo = () => {
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();
    const [editingField, setEditingField] = useState<string | null>(null);

    const handleSave = (field: string, value: string) => {
        updateUser({ [field]: value });
        setEditingField(null);
        toast.success(t('account.infoUpdated', 'Information updated successfully'));
    };

    const getValue = (val: string | undefined) => {
        return val || t('account.notProvided', 'Not provided');
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-6">{t('account.personalInfo', 'Personal information')}</h2>

            <div className="divide-y divide-border">
                <InfoRow
                    label={t('account.legalName', 'Legal name')}
                    value={getValue(user?.name)}
                    fieldKey="name"
                    isEditing={editingField === 'name'}
                    onStartEdit={() => setEditingField('name')}
                    onCancelEdit={() => setEditingField(null)}
                    onSave={(val) => handleSave('name', val)}
                />
                <InfoRow
                    label={t('account.preferredName', 'Preferred first name')}
                    value={getValue(user?.preferredName)}
                    fieldKey="preferredName"
                    isEditing={editingField === 'preferredName'}
                    onStartEdit={() => setEditingField('preferredName')}
                    onCancelEdit={() => setEditingField(null)}
                    onSave={(val) => handleSave('preferredName', val)}
                />
                <InfoRow
                    label={t('account.email', 'Email address')}
                    value={getValue(user?.email)}
                    fieldKey="email"
                    isEditing={editingField === 'email'}
                    onStartEdit={() => setEditingField('email')}
                    onCancelEdit={() => setEditingField(null)}
                    onSave={(val) => handleSave('email', val)}
                />
                <InfoRow
                    label={t('account.phone', 'Phone number')}
                    value={getValue(user?.phone)}
                    fieldKey="phone"
                    isEditing={editingField === 'phone'}
                    onStartEdit={() => setEditingField('phone')}
                    onCancelEdit={() => setEditingField(null)}
                    onSave={(val) => handleSave('phone', val)}
                />
                <InfoRow
                    label={t('account.address', 'Address')}
                    value={getValue(user?.address)}
                    fieldKey="address"
                    isEditing={editingField === 'address'}
                    onStartEdit={() => setEditingField('address')}
                    onCancelEdit={() => setEditingField(null)}
                    onSave={(val) => handleSave('address', val)}
                />
                <InfoRow
                    label={t('account.emergencyContact', 'Emergency contact')}
                    value={getValue(user?.emergencyContact)}
                    fieldKey="emergencyContact"
                    isEditing={editingField === 'emergencyContact'}
                    onStartEdit={() => setEditingField('emergencyContact')}
                    onCancelEdit={() => setEditingField(null)}
                    onSave={(val) => handleSave('emergencyContact', val)}
                />
            </div>
        </div>
    );
};

export default PersonalInfo;
