import React, { useState } from "react";
import { useQuery } from "react-query";
import {
  getNowPlayingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  IGetMoviesResult,
} from "../api.ts";
import styled from "styled-components";
import { makeImagePath } from "../utils.ts";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { PathMatch, useMatch, useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  background-color: black;
  padding-bottom: 200px;
  overflow-x: hidden;
`;

const Loader = styled.div`
  height: 20vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Banner = styled.div<{ $bgPhoto: string }>`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 1)),
    url(${(props) => props.$bgPhoto});
  background-size: cover;
`;

const Title = styled.h2`
  font-size: 68px;
  margin-bottom: 20px;
`;

const Overview = styled.p`
  font-size: 30px;
  width: 50%;
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

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  background-color: rgba(0, 0, 0, 0.5);
`;

const BigMovie = styled(motion.div)`
  position: absolute;
  width: 40vw;
  height: 80vh;
  right: 0;
  left: 0;
  margin: 0 auto;
  border-radius: 15px;
  overflow: hidden;
  background-color: ${(props) => props.theme.black.lighter};
`;

const BigCover = styled.div`
  width: 100%;
  background-size: cover;
  background-position: center center;
  height: 400px;
`;

const BigTitle = styled.h3`
  color: ${(props) => props.theme.white.lighter};
  padding: 20px;
  font-size: 46px;
  position: relative;
  top: -80px;
`;

const BigOverview = styled.p`
  padding: 20px;
  top: -80px;
  position: relative;
  color: ${(props) => props.theme.white.lighter};
`;

const BigEtc = styled.div`
  padding: 20px;
  top: -80px;
  position: relative;
  color: ${(props) => props.theme.white.lighter};
  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const RowTitle = styled.h2`
  color: ${(props) => props.theme.white.lighter};
  font-size: 46px;
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

function Home() {
  const history = useNavigate();
  const bigMovieMatch: PathMatch<string> | null = useMatch("movies/:movieId");
  const { scrollY } = useScroll();
  const useMultipleQuery = () => {
    const nowPlaying = useQuery<IGetMoviesResult>({
      queryKey: ["movies", "nowPlaying"],
      queryFn: getNowPlayingMovies,
    });
    const popular = useQuery<IGetMoviesResult>({
      queryKey: ["movies", "popular"],
      queryFn: getPopularMovies,
    });
    const topRated = useQuery<IGetMoviesResult>({
      queryKey: ["movies", "topRated"],
      queryFn: getTopRatedMovies,
    });
    const upComing = useQuery<IGetMoviesResult>({
      queryKey: ["movies", "upComing"],
      queryFn: getUpcomingMovies,
    });
    return [nowPlaying, popular, topRated, upComing];
  };
  const [
    { isLoading: nowPlayingLoading, data: nowPlayingData },
    { isLoading: popularLoading, data: popularData },
    { isLoading: topRatedLoading, data: topRatedData },
    { isLoading: upComingLoading, data: upComingData },
  ] = useMultipleQuery();
  const [nowIdx, setNowIdx] = useState(0);
  const [popularIdx, setPopularIdx] = useState(0);
  const [topIdx, setTopIdx] = useState(0);
  const [upIdx, setUpIdx] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [back, setBack] = useState(false);
  const increaseIndex = (data: IGetMoviesResult, index: string) => {
    if (data) {
      if (leaving) return;
      setBack(false);
      toggleLeaving();
      const totalMovies = data?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      if (index === "now") {
        setNowIdx((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else if (index === "pop") {
        setPopularIdx((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else if (index === "top") {
        setTopIdx((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else if (index === "up") {
        setUpIdx((prev) => (prev === maxIndex ? 0 : prev + 1));
      }
    }
  };
  const decreaseIndex = (data: IGetMoviesResult, index: string) => {
    if (data) {
      if (leaving) return;
      setBack(true);
      toggleLeaving();
      const totalMovies = data?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      if (index === "now") {
        setNowIdx((prev) => (prev === 0 ? maxIndex : prev - 1));
      } else if (index === "pop") {
        setPopularIdx((prev) => (prev === 0 ? maxIndex : prev - 1));
      } else if (index === "top") {
        setTopIdx((prev) => (prev === 0 ? maxIndex : prev - 1));
      } else if (index === "up") {
        setUpIdx((prev) => (prev === 0 ? maxIndex : prev - 1));
      }
    }
  };
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const onBoxClicked = (movieId: number) => {
    history(`movies/${movieId}`);
  };
  const onOverlayClick = () => history("");
  const clickedMovie =
    bigMovieMatch?.params.movieId &&
    nowPlayingData?.results.find(
      (movie) => movie.id === +bigMovieMatch.params.movieId!
    );
  console.log(clickedMovie);
  return (
    <Wrapper>
      {nowPlayingLoading &&
      popularLoading &&
      topRatedLoading &&
      upComingLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            $bgPhoto={makeImagePath(
              nowPlayingData?.results[0].backdrop_path || ""
            )}
          >
            <Title>{nowPlayingData?.results[0].title}</Title>
            <Overview>{nowPlayingData?.results[0].overview}</Overview>
          </Banner>
          <Slider>
            <AnimatePresence
              custom={back}
              initial={false}
              onExitComplete={toggleLeaving}
            >
              <RowTitle>Now Playing...</RowTitle>
              <Row
                custom={back}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={nowIdx}
              >
                <PrevBox onClick={() => decreaseIndex(nowPlayingData!, "now")}>
                  ˱
                </PrevBox>
                {nowPlayingData?.results
                  .slice(1)
                  .slice(offset * nowIdx, offset * nowIdx + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      whileHover="hover"
                      initial="normal"
                      key={movie.id}
                      variants={boxVarinats}
                      onClick={() => onBoxClicked(movie.id)}
                      transition={{ type: "tween" }}
                      $bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
                <NextBox onClick={() => increaseIndex(nowPlayingData!, "now")}>
                  ˲
                </NextBox>
              </Row>
            </AnimatePresence>
          </Slider>
          <Slider>
            <AnimatePresence
              custom={back}
              initial={false}
              onExitComplete={toggleLeaving}
            >
              <RowTitle>Latest Movies...</RowTitle>
              <Row
                custom={back}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={popularIdx}
              >
                <PrevBox onClick={() => decreaseIndex(popularData!, "pop")}>
                  ˱
                </PrevBox>
                {popularData?.results
                  .slice(1)
                  .slice(offset * popularIdx, offset * popularIdx + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      whileHover="hover"
                      initial="normal"
                      key={movie.id}
                      variants={boxVarinats}
                      onClick={() => onBoxClicked(movie.id)}
                      transition={{ type: "tween" }}
                      $bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
                <NextBox onClick={() => increaseIndex(popularData!, "pop")}>
                  ˲
                </NextBox>
              </Row>
            </AnimatePresence>
          </Slider>
          <Slider>
            <AnimatePresence
              custom={back}
              initial={false}
              onExitComplete={toggleLeaving}
            >
              <RowTitle>Top Rated Movies...</RowTitle>
              <Row
                custom={back}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={topIdx}
              >
                <PrevBox onClick={() => decreaseIndex(topRatedData!, "top")}>
                  ˱
                </PrevBox>
                {topRatedData?.results
                  .slice(1)
                  .slice(offset * topIdx, offset * topIdx + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      whileHover="hover"
                      initial="normal"
                      key={movie.id}
                      variants={boxVarinats}
                      onClick={() => onBoxClicked(movie.id)}
                      transition={{ type: "tween" }}
                      $bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
                <NextBox onClick={() => increaseIndex(topRatedData!, "top")}>
                  ˲
                </NextBox>
              </Row>
            </AnimatePresence>
          </Slider>
          <Slider>
            <AnimatePresence
              custom={back}
              initial={false}
              onExitComplete={toggleLeaving}
            >
              <RowTitle>Upcoming Movies...</RowTitle>
              <Row
                custom={back}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={upIdx}
              >
                <PrevBox onClick={() => decreaseIndex(upComingData!, "up")}>
                  ˱
                </PrevBox>
                {upComingData?.results
                  .slice(1)
                  .slice(offset * upIdx, offset * upIdx + offset)
                  .map((movie) => (
                    <Box
                      layoutId={movie.id + ""}
                      whileHover="hover"
                      initial="normal"
                      key={movie.id}
                      variants={boxVarinats}
                      onClick={() => onBoxClicked(movie.id)}
                      transition={{ type: "tween" }}
                      $bgPhoto={makeImagePath(movie.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{movie.title}</h4>
                      </Info>
                    </Box>
                  ))}
                <NextBox onClick={() => increaseIndex(upComingData!, "up")}>
                  ˲
                </NextBox>
              </Row>
            </AnimatePresence>
          </Slider>

          {/* movie Box click Page */}
          <AnimatePresence>
            {bigMovieMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigMovie
                  style={{ top: scrollY.get() + 100 }}
                  layoutId={bigMovieMatch.params.movieId}
                >
                  {clickedMovie && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `url(${makeImagePath(
                            clickedMovie.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedMovie.title}</BigTitle>
                      <BigOverview>{clickedMovie.overview}</BigOverview>
                      <BigEtc>
                        <div>Popular: {clickedMovie.popularity}</div>
                        <div>Release Date: {clickedMovie.release_date}</div>
                        <div>
                          ⭐️{clickedMovie.vote_average} / 🗳️
                          {clickedMovie.vote_count}
                        </div>
                      </BigEtc>
                    </>
                  )}
                </BigMovie>
              </>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </Wrapper>
  );
}

export default Home;
