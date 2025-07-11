// Lokasi file: src/features/Onboarding/AppTour.jsx
// Deskripsi: Komponen untuk mengelola tur aplikasi menggunakan react-joyride.

import React from 'react';
import Joyride, { STATUS } from 'react-joyride';

const tourSteps = [
    {
        target: '.nav-dashboard',
        content: 'Ini adalah Dasbor, tempat Anda melihat ringkasan aktivitas.',
        placement: 'right',
    },
    {
        target: '.nav-projects',
        content: 'Di sini Anda dapat mengelola semua proyek dan trial mix Anda.',
        placement: 'right',
    },
    {
        target: '.nav-materials',
        content: 'Kelola pustaka material dan hasil pengujiannya di sini.',
        placement: 'right',
    },
    {
        target: '.global-search',
        content: 'Gunakan pencarian ini untuk menemukan apa pun dengan cepat.',
        placement: 'bottom',
    },
];

const AppTour = ({ run, onTourEnd }) => {
    const handleJoyrideCallback = (data) => {
        const { status } = data;
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            onTourEnd();
        }
    };

    return (
        <Joyride
            callback={handleJoyrideCallback}
            continuous
            run={run}
            scrollToFirstStep
            showProgress
            showSkipButton
            steps={tourSteps}
            styles={{
                options: {
                    zIndex: 10000,
                },
            }}
        />
    );
};

export default AppTour;
s