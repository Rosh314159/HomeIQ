import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Box } from "@mui/material";

const RecentSearches = () => {
    const navigate = useNavigate();
    const [recentSearches, setRecentSearches] = useState([]);

    useEffect(() => {
        // Load recent searches from localStorage
        const savedSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
        console.log(savedSearches)
        setRecentSearches(savedSearches);
    }, []);

    const handleRecentClick = (house) => {
        navigate("/details", { state: { enrichedData: house } });
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: "#333" }}>
                Recent Searches
            </Typography>
            {recentSearches.length === 0 ? (
                <Typography variant="body1" sx={{ color: "#666" }}>
                    No recent searches available.
                </Typography>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {recentSearches.map((house, index) => (
                        <Card
                            key={index}
                            sx={{
                                cursor: "pointer",
                                "&:hover": { backgroundColor: "#f5f5f5" },
                                transition: "background 0.3s",
                                boxShadow: 2,
                                borderRadius: "10px",
                            }}
                            onClick={() => handleRecentClick(house)}
                        >
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                    {house.houseNameOrNumber}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {house.postcode}
                                </Typography>
                                <Typography variant="body2" color="primary">
                                    Predicted Price: £{house.predicted_price}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default RecentSearches;
