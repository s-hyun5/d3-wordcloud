import React, {useEffect} from "react";
import * as d3 from "d3";
import cloud from "d3-cloud";
import "./wordcolud.css";
import {sampleData} from "./data";

const WordCloud = () => {
    const words = sampleData;

    /***
     * svg width, height 설정
     */
    const width = 420,
        height = 187;
    const fillColor = d3.scale.category20();

    const optionsDefaultValue = {
        range: {
            // 폰트 최소, 최대 크기 설정
            max: 35,
            min: 10,
        },
        padding: 1.5, // 폰트 간격 설정
    };

    useEffect(() => {
        d3.select("#word-cloud").select("svg").remove();
        d3.select("#word-cloud").select(".wordCloud-tooltip").remove();

        const maxSize = d3.max(words, function (d) {
            return d.value;
        });
        const minSize = d3.min(words, function (d) {
            return d.value;
        });

        /***
         * 데이터 수에 따라 최대, 최소 폰트 크기, 폰트 사이 간격 조절
         */
        let padding = optionsDefaultValue.padding;
        let minRange = optionsDefaultValue.range.min;
        let maxRange = optionsDefaultValue.range.max;

        if (minSize === maxSize) {
            padding = 5;
            minRange = 25;
            maxRange = 25;
        } else {
            if (words.length < 50) {
                padding = 3.5;
                minRange = 16;
                maxRange = 30;
            } else if (words.length <= 100) {
                padding = 2;
                minRange = 14;
                maxRange = 35;
            } else if (words.length < 300) {
                minRange = 12;
                maxRange = 30;
            } else {
                padding = 1.5;
                minRange = 10;
                maxRange = 30;
            }
        }

        function wordCloud(selector) {
            const wordScale = d3.scale.linear().domain([minSize, maxSize]).range([minRange, maxRange]).clamp(true);

            /***
             * 클릭 이벤트
             */
            function handleClick(d) {
                const activeClass = "active";
                const alreadyIsActive = d3.select(this).classed(activeClass);
                svg.selectAll("text")
                    .classed(activeClass, false);
                d3.select(this).classed(activeClass, !alreadyIsActive);
            }

            const chartPositionX = document.getElementById("word-cloud").getBoundingClientRect().x;
            const chartPositionY = document.getElementById("word-cloud").getBoundingClientRect().y;

            const tooltip = d3.select("#word-cloud").append("div").attr("class", "wordCloud-tooltip");

            function handleMouseOver(d) {
                const targetX = d3.event.target.getBoundingClientRect().left;
                const targetY = d3.event.target.getBoundingClientRect().top;
                const targetWidth = d3.event.target.getBoundingClientRect().width;

                tooltip
                    .text(d.text)
                    .style("opacity", "1")
                    .style("top", targetY - chartPositionY + "px")
                    .style("left", targetX + targetWidth / 2 - chartPositionX + "px")
                    .style("transform", "translate(-50%, calc(-100% - 5px))")
                    .style("z-index", "9999");
            }

            function handleMouseOut() {
                tooltip.style("opacity", "0");
            }

            const svg = d3
                .select(selector)
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            function draw(words) {
                const cloud = svg.selectAll("g text").data(words, function (d) {
                    return d.text;
                });

                cloud
                    .enter()
                    .append("text")
                    .on("click", handleClick)
                    .on("mouseover", handleMouseOver)
                    .on("mouseout", handleMouseOut)
                    .attr("cursor", "pointer")
                    .attr("text-anchor", "middle")
                    .attr("transform", function (d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    })
                    .style("font-size", function (d) {
                        return d.size + "px";
                    })
                    .style("font-weight", function (d) {
                        return d.size > 15 ? 900 : 600;
                    })
                    .style("font-family", "Impact")
                    .style("fill", function (d, i) {
                        return fillColor(i);
                    })
                    .text(function (d) {
                        return d.text;
                    })


                cloud
                    .transition()
                    .duration(500)
                    .attr("transform", function (d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    });

                cloud
                    .exit()
                    .transition()
                    .duration(200)
                    .attr("transform", function (d) {
                        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                    });
            }

            return {
                update: function (words) {
                    cloud()
                        .size([width, height])
                        .words(
                            words.map(function (d) {
                                return { text: d.text, size: d.value };
                            })
                        )
                        .padding(padding)
                        .rotate(0)
                        .fontSize(function (d) {
                            return wordScale(d.size);
                        })
                        .spiral("archimedean")
                        .on("end", draw)
                        .start();
                },
            };
        }

        function showWords(chart) {
            chart.update(words);
        }

        const myWordCloud = wordCloud("#word-cloud");

        showWords(myWordCloud);
    }, [words]);

    return (
        <>
            <div className={`wordCloudChart`} id={"word-cloud"} />
        </>
    );
};

export default WordCloud;