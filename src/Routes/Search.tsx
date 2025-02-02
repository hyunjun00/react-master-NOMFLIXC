import React, { useState } from "react";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import {
  IGetMoviesResult,
  IGetTvsResult,
  searchMovies,
  searchTvs,
} from "../api.ts";
import { AnimatePresence, motion } from "framer-motion";
import { makeImagePath } from "../utils.ts";

const Wrapper = styled.div`
  background-color: black;
  overflow-x: hidden;
  position: relative;
  top: 100px;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SearchTitle = styled.h2`
  color: ${(props) => props.theme.white.lighter};
  font-size: 56px;
  height: 30vh;
  padding: 60px;
`;

const Slider = styled.div`
  position: relative;
  top: -100px;
  margin-bottom: 300px;
`;

const Row = styled(motion.div)`
  display: grid;
  gap: 5px;
  grid-template-columns: 0.3fr 1fr 1fr 1fr 1fr 1fr 1fr 0.3fr;
  position: absolute;
  width: 100%;
`;

const Box = styled(motion.div)<{ $bgPhoto: string }>`
  background-color: white;
  background-image: url(${(props) => props.$bgPhoto});
  background-size: cover;
  background-position: center center;
  height: 200px;
  font-size: 60px;
  cursor: pointer;
  &:first-child {
    transform-origin: center left;
  }
  &:last-child {
    transform-origin: center right;
  }
`;

const RowTitle = styled.h2`
  color: ${(props) => props.theme.white.lighter};
  font-size: 46px;
  padding: 0px 60px;
`;

const NextBox = styled.p`
  background-color: transparent;
  height: 200px;
  font-size: 60px;
  width: 10%;
  padding: 10px;
  position: relative;
  cursor: pointer;
`;

const PrevBox = styled.div`
  background-color: transparent;
  height: 200px;
  font-size: 60px;
  width: 10%;
  padding: 10px;
  position: relative;
  cursor: pointer;
`;

const Info = styled(motion.div)`
  padding: 10px;
  background-color: ${(props) => props.theme.black.lighter};
  opacity: 0;
  position: absolute;
  width: 100%;
  bottom: 0;
  h4 {
    text-align: center;
    font-size: 18px;
  }
`;

const rowVariants = {
  hidden: (isBack: boolean) => ({
    x: isBack ? -window.outerWidth - 5 : window.outerWidth + 5,
  }),
  visible: {
    x: 0,
  },
  exit: (isBack: boolean) => ({
    x: isBack ? window.outerWidth + 5 : -window.outerWidth - 5,
  }),
};

const boxVarinats = {
  normal: {
    scale: 1,
  },
  hover: {
    scale: 1.3,
    y: -80,
    transition: {
      delay: 0.5,
      duration: 0.1,
      type: "tween",
    },
  },
};

const offset = 6;

const infoVariants = {
  hover: {
    opacity: 1,
    transition: {
      delay: 0.5,
      duration: 0.1,
      type: "tween",
    },
  },
};

function Search() {
  const location = useLocation();
  const keyword = new URLSearchParams(location.search).get("keyword");
  const useMultipleQuery = () => {
    const searchMovie = useQuery<IGetMoviesResult>({
      queryKey: ["movies", "searchMovie"],
      queryFn: () => searchMovies(keyword!),
    });
    const searchTv = useQuery<IGetTvsResult>({
      queryKey: ["tvs", "searchTv"],
      queryFn: () => searchTvs(keyword!),
    });
    return [searchMovie, searchTv];
  };
  const [leaving, setLeaving] = useState(false);
  const [back, setBack] = useState(false);
  const [movieIdx, setMovieIdx] = useState(0);
  const [tvIdx, setTvIdx] = useState(0);
  const increaseIndex = (
    data: IGetMoviesResult | IGetTvsResult,
    index: string
  ) => {
    if (data) {
      if (leaving) return;
      setBack(false);
      toggleLeaving();
      const totalMovies = data?.results.length - 1;
      const maxIndex = Math.ceil(totalMovies / offset) - 1;
      if (index === "movie") {
        setMovieIdx((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else if (index === "tv") {
        setTvIdx((prev) => (prev === maxIndex ? 0 : prev + 1));
      }
    }
  };
  const decreaseIndex = (
    data: IGetMoviesResult | IGetTvsResult,
    index: string
  ) => {
    if (data) {
      if (leaving) return;
      setBack(true);
      toggleLeaving();
      const totalMovies = data?.results.length - 1;
      const maxIndex = Math.ceil(totalMovies / offset) - 1;
      if (index === "movie") {
        setMovieIdx((prev) => (prev === 0 ? maxIndex : prev - 1));
      } else if (index === "tv") {
        setTvIdx((prev) => (prev === 0 ? maxIndex : prev - 1));
      }
    }
  };
  const toggleLeaving = () => setLeaving((prev) => !prev);

  const [
    { isLoading: searchMovieLoading, data: searchMovieData },
    { isLoading: searchTvLoading, data: searchTvData },
  ] = useMultipleQuery();
  return (
    <Wrapper>
      {searchMovieLoading || searchTvLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <SearchTitle>Search for : {keyword}</SearchTitle>
          <Slider>
            <AnimatePresence custom={back} initial={false}>
              <RowTitle>Movie...</RowTitle>
              <Row
                custom={back}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={movieIdx}
              >
                <PrevBox
                  onClick={() => decreaseIndex(searchMovieData!, "movie")}
                >
                  ˱
                </PrevBox>
                {searchMovieData?.results
                  .slice(1)
                  .slice(offset * movieIdx, offset * movieIdx + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      whileHover="hover"
                      initial="normal"
                      key={movie.id}
                      variants={boxVarinats}
                      transition={{ type: "tween" }}
                      $bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
                <NextBox
                  onClick={() => increaseIndex(searchMovieData!, "movie")}
                >
                  ˲
                </NextBox>
              </Row>
            </AnimatePresence>
          </Slider>
          <Slider>
            <AnimatePresence custom={back} initial={false}>
              <RowTitle>Tv...</RowTitle>
              <Row
                custom={back}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={tvIdx}
              >
                <PrevBox onClick={() => decreaseIndex(searchTvData!, "tv")}>
                  ˱
                </PrevBox>
                {searchTvData?.results
                  .slice(1)
                  .slice(offset * tvIdx, offset * tvIdx + offset)
                  .map((tv) => (
                    <Box
                      layoutId={tv.id + ""}
                      whileHover="hover"
                      initial="normal"
                      key={tv.id}
                      variants={boxVarinats}
                      transition={{ type: "tween" }}
                      $bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{tv.name}</h4>
                      </Info>
                    </Box>
                  ))}
                <NextBox onClick={() => increaseIndex(searchTvData!, "tv")}>
                  ˲
                </NextBox>
              </Row>
            </AnimatePresence>
          </Slider>
        </>
      )}
    </Wrapper>
  );
}

export default Search;
