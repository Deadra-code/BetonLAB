import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'; // Menggunakan komponen Card

const ResultCard = ({ title, data, unit, icon }) => (
    <Card className="bg-muted/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
                {title}
            </CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">
                {data}
            </div>
            <p className="text-xs text-muted-foreground">
                {unit}
            </p>
        </CardContent>
    </Card>
);

export default ResultCard;
