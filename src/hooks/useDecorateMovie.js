import { useCallback } from 'react';
import { GENRE_NAMES } from '../services/movieService';
import { computeAverage } from '../utils/rating';
import { getYear } from '../utils/format';

/** Adds derived display fields (year, genre names, user-adjusted average) to a movie. */
export function useDecorateMovie() {
  return useCallback(
    (movie, userRating = 0) => {
      const { average, count } = computeAverage(movie.voteAverage, movie.voteCount, userRating);
      const genreNames = movie.genres?.length
        ? movie.genres.map((g) => g.name)
        : (movie.genreIds || []).map((id) => GENRE_NAMES.get(id)).filter(Boolean);
      return {
        ...movie,
        year: getYear(movie.releaseDate),
        genreNames,
        userRating,
        average,
        ratingCount: count,
      };
    },
    [],
  );
}
