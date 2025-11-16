import React from 'react';
import { Card, CardContent, CardMedia, CardActions, Typography, Box, Button } from '@mui/material';

export const MainDashboardCard = ({ goToPageAction, actionText, imageUrl, title, description }) => {
    return (
        <Card sx={{ borderRadius: '1.5rem', mx: { xs: 2, sm: 0 } }}>
            <CardMedia
                component="img"
                height="194"
                image={imageUrl}
                alt="Main dashboard card image"
            />
            <CardContent>
                <Typography variant="h6" component="p" fontWeight="bold">
                    {title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {description}
                </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                <Button variant="contained" onClick={goToPageAction} sx={{ borderRadius: '0.75rem' }}>{actionText}</Button>
            </CardActions>
        </Card>
    )
}

export const DashboardCard = ({ goToPageAction, actionText, title, description, imageUrl }) => {

    return (
        <Card sx={{ display: 'flex', justifyContent: 'space-between', borderRadius: '1.5rem', mx: { xs: 2, sm: 0 }, p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent sx={{ p: 1, flex: '1 0 auto' }}>
                    <Typography component="div" variant="h6" fontWeight="bold">
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="div">
                        {description}
                    </Typography>
                </CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
                    <Button variant="contained" color="secondary" onClick={goToPageAction} sx={{ borderRadius: '0.75rem' }}>
                        {actionText}
                    </Button>
                </Box>
            </Box>
            <CardMedia
                component="img"
                sx={{ width: 120, height: 120, borderRadius: '1rem' }}
                image={imageUrl}
                alt="Dashboard card image"
            />
        </Card>
    )
}
