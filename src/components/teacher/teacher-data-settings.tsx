
"use client";

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import type { User } from '@/lib/types';
import { useLanguage } from '@/context/language-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile } from '@/lib/firestore';
import { updateUserCredentials } from '@/lib/firebase';

interface TeacherDataSettingsProps {
    user: User;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TeacherDataSettings({ user, isOpen, onOpenChange }: TeacherDataSettingsProps) {
    const { language, translations } = useLanguage();
    const { toast } = useToast();
    const t = translations.dataSettings;

    const infoSchema = z.object({
        phone: z.string().min(1, t.validations.phoneRequired),
    });

    const credentialsSchema = z.object({
        email: z.string().email(t.validations.emailInvalid),
        password: z.string().min(6, t.validations.passwordLength),
        currentPassword: z.string().min(1, t.validations.currentPasswordRequired),
    });

    const infoForm = useForm<z.infer<typeof infoSchema>>({
        resolver: zodResolver(infoSchema),
        defaultValues: { phone: (user as any).phone || '' },
    });

    const credentialsForm = useForm<z.infer<typeof credentialsSchema>>({
        resolver: zodResolver(credentialsSchema),
        defaultValues: { email: user.email || '', password: '', currentPassword: '' },
    });
    
    const [isInfoSubmitting, setIsInfoSubmitting] = useState(false);
    const [isCredentialsSubmitting, setIsCredentialsSubmitting] = useState(false);

    const onInfoSubmit = async (data: z.infer<typeof infoSchema>) => {
        setIsInfoSubmitting(true);
        try {
            await updateUserProfile(user.id, { phone: data.phone });
            
            // Update local storage
            const storedUser = JSON.parse(localStorage.getItem("uncoverly-user") || '{}');
            storedUser.phone = data.phone;
            localStorage.setItem("uncoverly-user", JSON.stringify(storedUser));
            
            toast({ title: t.toasts.infoSuccessTitle, description: t.toasts.infoSuccessDescription });
            onOpenChange(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: t.toasts.errorTitle, description: error.message });
        } finally {
            setIsInfoSubmitting(false);
        }
    };
    
    const onCredentialsSubmit = async (data: z.infer<typeof credentialsSchema>) => {
        setIsCredentialsSubmitting(true);
        try {
            await updateUserCredentials(data.currentPassword, data.email, data.password);
            
            const storedUser = JSON.parse(localStorage.getItem("uncoverly-user") || '{}');
            storedUser.email = data.email;
            localStorage.setItem("uncoverly-user", JSON.stringify(storedUser));

            toast({ title: t.toasts.credentialsSuccessTitle, description: t.toasts.credentialsSuccessDescription });
            onOpenChange(false);
        } catch (error: any) {
             toast({ variant: 'destructive', title: t.toasts.errorTitle, description: t.toasts.credentialsError.replace('{message}', error.message) });
        } finally {
            setIsCredentialsSubmitting(false);
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.title}</DialogTitle>
                    <DialogDescription>{t.description}</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="info">{t.tabs.personalInfo}</TabsTrigger>
                        <TabsTrigger value="credentials">{t.tabs.credentials}</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="info">
                        <Form {...infoForm}>
                            <form onSubmit={infoForm.handleSubmit(onInfoSubmit)} className="space-y-6 py-4">
                                <FormField
                                    control={infoForm.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.phoneLabel}</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="ghost">{t.cancelButton}</Button></DialogClose>
                                    <Button type="submit" disabled={isInfoSubmitting}>
                                        {isInfoSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t.saveButton}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>
                    
                    <TabsContent value="credentials">
                       <Form {...credentialsForm}>
                            <form onSubmit={credentialsForm.handleSubmit(onCredentialsSubmit)} className="space-y-4 py-4">
                                <p className="text-sm text-muted-foreground">{t.credentialsNotice}</p>
                                <FormField
                                    control={credentialsForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.emailLabel}</FormLabel>
                                            <FormControl><Input type="email" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={credentialsForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.newPasswordLabel}</FormLabel>
                                            <FormControl><Input type="password" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={credentialsForm.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t.currentPasswordLabel}</FormLabel>
                                            <FormControl><Input type="password" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="ghost">{t.cancelButton}</Button></DialogClose>
                                    <Button type="submit" disabled={isCredentialsSubmitting}>
                                        {isCredentialsSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {t.saveButton}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
