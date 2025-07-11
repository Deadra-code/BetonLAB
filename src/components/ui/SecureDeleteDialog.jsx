import React, { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from './alert-dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

/**
 * A secure confirmation dialog that requires the user to type a confirmation text.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.trigger - The element that triggers the dialog.
 * @param {string} props.title - The title of the dialog.
 * @param {string} props.description - The description text in the dialog.
 * @param {string} props.confirmationText - The text the user must type to confirm.
 * @param {function} props.onConfirm - The function to call when the action is confirmed.
 */
export const SecureDeleteDialog = ({ trigger, title, description, confirmationText, onConfirm }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const isConfirmationMatching = inputValue === confirmationText;

    const handleConfirm = (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        if (isConfirmationMatching) {
            onConfirm();
            setIsOpen(false);
            setInputValue('');
        }
    };
    
    // PERBAIKAN: Menambahkan e.stopPropagation() pada handler onClick trigger
    const handleTriggerClick = (e) => {
        e.stopPropagation();
        setIsOpen(true);
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild onClick={handleTriggerClick}>
                {trigger}
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                        <br />
                        Untuk melanjutkan, ketik <strong className="text-destructive">{confirmationText}</strong> di bawah ini.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2">
                    <Label htmlFor="delete-confirm-input" className="sr-only">
                        Konfirmasi Hapus
                    </Label>
                    <Input
                        id="delete-confirm-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        autoComplete="off"
                        placeholder={`Ketik "${confirmationText}"`}
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setInputValue('')}>Batal</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={!isConfirmationMatching}
                    >
                        Hapus Permanen
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
