import React, { useState } from "react";
import { useQuery } from "react-query";
import {
  getAiringTodayTvs,
  getOnTheAirTvs,
  getPopularTvs,
  getTopRatedTvs,
  IGetTvsResult,
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
  /* display: grid;
  grid-template-columns: 1fr 6fr 1fr; */
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

function Tv() {
  const history = useNavigate();
  const bigTvMatch: PathMatch<string> | null = useMatch("tv/:tvId");
  const { scrollY } = useScroll();
  const useMultipleQuery = () => {
    const airingToday = useQuery<IGetTvsResult>({
      queryKey: ["tv", "airing_today"],
      queryFn: getAiringTodayTvs,
    });
    const onTheAir = useQuery<IGetTvsResult>({
      queryKey: ["tv", "on_the_air"],
      queryFn: getOnTheAirTvs,
    });
    const topRated = useQuery<IGetTvsResult>({
      queryKey: ["tv", "topRated"],
      queryFn: getTopRatedTvs,
    });
    const popular = useQuery<IGetTvsResult>({
      queryKey: ["tv", "popular"],
      queryFn: getPopularTvs,
    });
    return [airingToday, onTheAir, topRated, popular];
  };
  const [
    { isLoading: airingTodayLoading, data: airingTodayData },
    { isLoading: onTheAirLoading, data: onTheAirData },
    { isLoading: topRatedLoading, data: topRatedData },
    { isLoading: popularLoading, data: popularData },
  ] = useMultipleQuery();
  const [airIdx, setAirIdx] = useState(0);
  const [onTheAirIdx, setOnTheAirIdx] = useState(0);
  const [topIdx, setTopIdx] = useState(0);
  const [popularIdx, setPopularIdx] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [back, setBack] = useState(false);
  const increaseIndex = (data: IGetTvsResult, index: string) => {
    if (data) {
      if (leaving) return;
      setBack(false);
      toggleLeaving();
      const totalMovies = data?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      if (index === "air") {
        setAirIdx((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else if (index === "on_the_air") {
        setOnTheAirIdx((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else if (index === "top") {
        setTopIdx((prev) => (prev === maxIndex ? 0 : prev + 1));
      } else if (index === "pop") {
        setPopularIdx((prev) => (prev === maxIndex ? 0 : prev + 1));
      }
    }
  };
  const decreaseIndex = (data: IGetTvsResult, index: string) => {
    if (data) {
      if (leaving) return;
      setBack(true);
      toggleLeaving();
      const totalMovies = data?.results.length - 1;
      const maxIndex = Math.floor(totalMovies / offset) - 1;
      if (index === "air") {
        setAirIdx((prev) => (prev === 0 ? maxIndex : prev - 1));
      } else if (index === "on_the_air") {
        setOnTheAirIdx((prev) => (prev === 0 ? maxIndex : prev - 1));
      } else if (index === "top") {
        setTopIdx((prev) => (prev === 0 ? maxIndex : prev - 1));
      } else if (index === "pop") {
        setPopularIdx((prev) => (prev === 0 ? maxIndex : prev - 1));
      }
    }
  };
  const toggleLeaving = () => setLeaving((prev) => !prev);
  const onBoxClicked = (tvId: number) => {
    history(`/tv/${tvId}`);
  };
  const onOverlayClick = () => history("/tv");
  const clickedTv =
    bigTvMatch?.params.tvId &&
    airingTodayData?.results.find((tv) => tv.id === +bigTvMatch.params.tvId!);
  return (
    <Wrapper>
      {airingTodayLoading &&
      onTheAirLoading &&
      topRatedLoading &&
      popularLoading ? (
        <Loader>Loading...</Loader>
      ) : (
        <>
          <Banner
            $bgPhoto={makeImagePath(
              airingTodayData?.results[0].backdrop_path || ""
            )}
          >
            <Title>{airingTodayData?.results[0].name}</Title>
            <Overview>{airingTodayData?.results[0].overview}</Overview>
          </Banner>
          <Slider>
            <AnimatePresence
              custom={back}
              initial={false}
              onExitComplete={toggleLeaving}
            >
              <RowTitle>Airing Today...</RowTitle>
              <Row
                custom={back}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={airIdx}
              >
                <PrevBox onClick={() => decreaseIndex(airingTodayData!, "air")}>
                  ˱
                </PrevBox>
                {airingTodayData?.results
                  .slice(1)
                  .slice(offset * airIdx, offset * airIdx + offset)
                  .map((tv) => (
                    <Box
                      layoutId={tv.id + ""}
                      whileHover="hover"
                      initial="normal"
                      key={tv.id}
                      variants={boxVarinats}
                      onClick={() => onBoxClicked(tv.id)}
                      transition={{ type: "tween" }}
                      $bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{tv.name}</h4>
                      </Info>
                    </Box>
                  ))}
                <NextBox onClick={() => increaseIndex(airingTodayData!, "air")}>
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
              <RowTitle>On The Air...</RowTitle>
              <Row
                custom={back}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ type: "tween", duration: 1 }}
                key={onTheAirIdx}
              >
                <PrevBox
                  onClick={() => decreaseIndex(onTheAirData!, "on_the_air")}
                >
                  ˱
                </PrevBox>
                {onTheAirData?.results
                  .slice(1)
                  .slice(offset * onTheAirIdx, offset * onTheAirIdx + offset)
                  .map((tv) => (
                    <Box
                      layoutId={tv.id + ""}
                      whileHover="hover"
                      initial="normal"
                      key={tv.id}
                      variants={boxVarinats}
                      onClick={() => onBoxClicked(tv.id)}
                      transition={{ type: "tween" }}
                      $bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{tv.name}</h4>
                      </Info>
                    </Box>
                  ))}
                <NextBox
                  onClick={() => increaseIndex(onTheAirData!, "on_the_air")}
                >
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
                  .map((tv) => (
                    <Box
                      layoutId={tv.id + ""}
                      whileHover="hover"
                      initial="normal"
                      key={tv.id}
                      variants={boxVarinats}
                      onClick={() => onBoxClicked(tv.id)}
                      transition={{ type: "tween" }}
                      $bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{tv.name}</h4>
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
              <RowTitle>Popular...</RowTitle>
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
                  .map((tv) => (
                    <Box
                      layoutId={tv.id + ""}
                      whileHover="hover"
                      initial="normal"
                      key={tv.id}
                      variants={boxVarinats}
                      onClick={() => onBoxClicked(tv.id)}
                      transition={{ type: "tween" }}
                      $bgPhoto={makeImagePath(tv.backdrop_path, "w500")}
                    >
                      <Info variants={infoVariants}>
                        <h4>{tv.name}</h4>
                      </Info>
                    </Box>
                  ))}
                <NextBox onClick={() => increaseIndex(popularData!, "pop")}>
                  ˲
                </NextBox>
              </Row>
            </AnimatePresence>
          </Slider>

          {/* tv Box click Page */}
          <AnimatePresence>
            {bigTvMatch ? (
              <>
                <Overlay
                  onClick={onOverlayClick}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                <BigMovie
                  style={{ top: scrollY.get() + 100 }}
                  layoutId={bigTvMatch.params.tvId}
                >
                  {clickedTv && (
                    <>
                      <BigCover
                        style={{
                          backgroundImage: `url(${makeImagePath(
                            clickedTv.backdrop_path,
                            "w500"
                          )})`,
                        }}
                      />
                      <BigTitle>{clickedTv.name}</BigTitle>
                      <BigOverview>{clickedTv.overview}</BigOverview>
                      <BigEtc>
                        <div>Popular: {clickedTv.popularity}</div>
                        <div>First Air Date: {clickedTv.first_air_date}</div>
                        <div>
                          ⭐️{clickedTv.vote_average} / 🗳️
                          {clickedTv.vote_count}
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

export default Tv;
