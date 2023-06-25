import React from 'react';
import StarRatings from 'react-star-ratings';

// This component is used to display a rating stars so the user can rate a translation
const RatingStars = ({ rating, changeRating }) => (
    <div className="rating-section">
        <h4>Rate this translation:</h4>
        <StarRatings
            rating={rating}
            starRatedColor="blue"
            changeRating={changeRating}
            numberOfStars={5}
            name='rating'
            starDimension="15px"
            starSpacing="3px"
        />
    </div>
);

export default RatingStars;
