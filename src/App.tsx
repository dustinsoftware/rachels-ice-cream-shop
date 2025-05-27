import { useState } from "react";
import React from "react";

// Generate 20 random flavors
const flavorNames = [
  "Vanilla",
  "Chocolate",
  "Strawberry",
  "Mint",
  "Cookie Dough",
  "Pistachio",
  "Lemon",
  "Coffee",
  "Caramel",
  "Mango",
  "Blueberry",
  "Raspberry",
  "Peach",
  "Banana",
  "Coconut",
  "Matcha",
  "Pumpkin",
  "Cherry",
  "Grape",
  "Almond",
];
const getRandomFlavors = () => {
  return flavorNames
    .map((f) => ({ flavor: f, id: Math.random() }))
    .sort(() => 0.5 - Math.random())
    .slice(0, 20);
};

const toppingsList = [
  "Sprinkles",
  "Chocolate Chips",
  "Nuts",
  "Caramel Drizzle",
  "Whipped Cream",
  "Cherries",
];

// Placeholder customer avatars
const customerAvatars = [
  "👩‍🦰",
  "🧑‍🦱",
  "👨‍🦳",
  "👩‍🦱",
  "🧔",
  "👩",
  "👨",
  "🧑",
  "👵",
  "👴",
];

function App() {
  const [flavors] = useState(getRandomFlavors());
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [money, setMoney] = useState(20);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [round, setRound] = useState(1);
  const [showOutOfTime, setShowOutOfTime] = useState(false);
  const [customerNeeds, setCustomerNeeds] = useState(() => Array(5).fill(1));
  const [showHome, setShowHome] = useState(true);
  const [paused, setPaused] = useState(false);

  // Helper to get the current round based on correctCount
  React.useEffect(() => {
    setRound(Math.floor(correctCount / 5) + 1);
  }, [correctCount]);

  // When round changes, update customerNeeds to new round value
  React.useEffect(() => {
    setCustomerNeeds(Array(5).fill(round));
    setTimer(60 + (round - 1) * 10); // <-- update timer for new round
  }, [round]);

  // Timer effect
  React.useEffect(() => {
    if (gameOver || paused || showHome) return;
    if (timer <= 0) {
      setShowOutOfTime(true);
      setMoney((m) => {
        const newMoney = m - 10;
        if (newMoney <= 0) setGameOver(true);
        return newMoney;
      });
      setWrongCount((w) => w + 1);
      setTimeout(() => {
        setShowOutOfTime(false);
        setTimer(60 + (round - 1) * 10); // <-- update timer reset logic
        setSelectedFlavor(null);
        setSelectedToppings([]);
        setCustomerNeeds((needs) => {
          const newNeeds = [...needs];
          newNeeds[0] = newNeeds[0] - 1;
          if (newNeeds[0] <= 0) {
            setCustomers((prev) => [
              ...prev.slice(1),
              {
                avatar:
                  customerAvatars[
                    Math.floor(Math.random() * customerAvatars.length)
                  ],
                order: {
                  flavor:
                    flavors[Math.floor(Math.random() * flavors.length)].flavor,
                  toppings: [
                    toppingsList[
                      Math.floor(Math.random() * toppingsList.length)
                    ],
                  ],
                },
              },
            ]);
            return [...newNeeds.slice(1), round];
          }
          return newNeeds;
        });
      }, 1000);
      setMessage("Time is up! You lost $10. Try again!");
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [
    timer,
    gameOver,
    round,
    flavors,
    toppingsList,
    customerAvatars,
    paused,
    showHome,
  ]);

  React.useEffect(() => {
    if (money <= 0) setGameOver(true);
  }, [money]);

  // 5 customers at the counter
  const [customers, setCustomers] = useState(() =>
    Array.from({ length: 5 }, () => ({
      avatar:
        customerAvatars[Math.floor(Math.random() * customerAvatars.length)],
      order: {
        flavor: flavors[Math.floor(Math.random() * flavors.length)].flavor,
        toppings: [
          toppingsList[Math.floor(Math.random() * toppingsList.length)],
        ],
      },
    }))
  );
  // The first customer is the one being served
  const customerOrder = customers[0].order;
  const currentCustomerNeeds = customerNeeds[0];

  const handleServe = () => {
    if (gameOver) return;
    if (!selectedFlavor) {
      setMessage("Pick a flavor!");
      return;
    }
    // Check if order matches
    if (
      selectedFlavor === customerOrder.flavor &&
      selectedToppings.sort().join(",") ===
        customerOrder.toppings.sort().join(",")
    ) {
      setMoney((m) => m + 5);
      setMessage("Great job! You served the right ice cream!");
      setCorrectCount((c) => c + 1);
      setCustomerNeeds((needs) => {
        const newNeeds = [...needs];
        newNeeds[0] = newNeeds[0] - 1;
        // Only advance to next customer and reset timer if this customer is satisfied
        if (newNeeds[0] <= 0) {
          setCustomers((prev) => [
            ...prev.slice(1),
            {
              avatar:
                customerAvatars[
                  Math.floor(Math.random() * customerAvatars.length)
                ],
              order: {
                flavor:
                  flavors[Math.floor(Math.random() * flavors.length)].flavor,
                toppings: [
                  toppingsList[Math.floor(Math.random() * toppingsList.length)],
                ],
              },
            },
          ]);
          setTimer(60 + (round - 1) * 10); // <-- update timer reset logic
          return [...newNeeds.slice(1), round];
        }
        // Do not reset timer if customer still needs more ice cream
        return newNeeds;
      });
      setSelectedFlavor(null);
      setSelectedToppings([]);
    } else {
      setMoney((m) => {
        const newMoney = m - 2;
        if (newMoney <= 0) setGameOver(true);
        return newMoney;
      });
      setMessage("Oops! The customer wanted something else.");
      setShowWrong(true);
      setTimeout(() => setShowWrong(false), 1000);
      setWrongCount((w) => w + 1);
    }
  };

  const handleToppingToggle = (topping: string) => {
    setSelectedToppings((tops) =>
      tops.includes(topping)
        ? tops.filter((t) => t !== topping)
        : [...tops, topping]
    );
  };

  if (showHome) {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          background:
            "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 20%, #fbc2eb 40%, #a1c4fd 60%, #c2ffd8 80%, #fcb69f 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Comic Sans MS, Comic Sans, cursive, sans-serif",
          color: "#333",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 10000,
        }}
      >
        <h1
          style={{
            fontSize: "3em",
            fontWeight: "bold",
            background:
              "linear-gradient(90deg, #ff6a00, #ffb800, #00ff6a, #00cfff, #a259ff, #ff43a1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "0.5em",
            textShadow: "0 2px 8px #fff8",
          }}
        >
          Rachel's ice cream shop
        </h1>
        <div
          style={{
            fontSize: "1.3em",
            background: "rgba(255,255,255,0.8)",
            borderRadius: "16px",
            padding: "1.5em 2em",
            marginBottom: "2em",
            boxShadow: "0 2px 12px #0002",
            maxWidth: "500px",
            textAlign: "center",
          }}
        >
          Welcome to Rachel's ice cream shop!
          <br />
          <br />
          Serve customers by making their favorite ice cream with the right
          flavors and toppings.
          <br />
          Each round, customers will want more ice creams!
          <br />
          Earn money, keep your customers happy, and see how many rounds you can
          survive.
          <br />
          <br />
          <span style={{ color: "#43a047", fontWeight: "bold" }}>✔️</span> Get
          orders right to earn money.
          <br />
          <span style={{ color: "#d32f2f", fontWeight: "bold" }}>❌</span> Get
          them wrong or run out of time to lose money.
          <br />
          <span style={{ color: "#ff43a1", fontWeight: "bold" }}>⏰</span> You
          have <b>1 minute</b> per ice cream, plus <b>10 extra seconds</b> for
          each new round!
        </div>
        <button
          style={{
            background: "linear-gradient(90deg, #ffb800, #ff43a1, #00cfff)",
            color: "#fff",
            fontWeight: "bold",
            border: "none",
            borderRadius: "12px",
            padding: "1em 3em",
            fontSize: "1.3em",
            boxShadow: "0 2px 8px #0003",
            cursor: "pointer",
            letterSpacing: "1px",
            marginTop: "1em",
            textShadow: "0 1px 6px #0006",
            outline: "none",
            transition: "background 0.2s, transform 0.1s",
          }}
          onClick={() => {
            setShowHome(false);
            setTimer(60); // <-- set timer to 60 seconds on game start
          }}
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Pause/Unpause Button and Home Button */}
      {!gameOver && (
        <div
          style={{
            position: "fixed",
            top: 24,
            left: 32,
            zIndex: 10001,
            display: "flex",
            gap: "0.5em",
          }}
        >
          {paused ? (
            <button
              style={{
                background: "linear-gradient(90deg, #43a047, #00cfff)",
                color: "#fff",
                fontWeight: "bold",
                border: "none",
                borderRadius: "12px",
                padding: "0.7em 2em",
                fontSize: "1.1em",
                boxShadow: "0 2px 8px #0003",
                cursor: "pointer",
                letterSpacing: "1px",
                marginRight: "0.5em",
                textShadow: "0 1px 6px #0006",
                outline: "none",
                transition: "background 0.2s, transform 0.1s",
              }}
              onClick={() => {
                setPaused(false);
                // If timer is 0 or less and overlays are showing, reset timer and overlays
                if (timer <= 0) {
                  setTimer(60 + (round - 1) * 10);
                  setShowOutOfTime(false);
                  setShowWrong(false);
                  setMessage("");
                  setSelectedFlavor(null);
                  setSelectedToppings([]);
                }
              }}
            >
              Unpause
            </button>
          ) : (
            <button
              style={{
                background: "linear-gradient(90deg, #ffb800, #ff43a1, #00cfff)",
                color: "#fff",
                fontWeight: "bold",
                border: "none",
                borderRadius: "12px",
                padding: "0.7em 2em",
                fontSize: "1.1em",
                boxShadow: "0 2px 8px #0003",
                cursor: "pointer",
                letterSpacing: "1px",
                marginRight: "0.5em",
                textShadow: "0 1px 6px #0006",
                outline: "none",
                transition: "background 0.2s, transform 0.1s",
              }}
              onClick={() => setPaused(true)}
            >
              Pause
            </button>
          )}
          {/* Home Button */}
          <button
            style={{
              background: "linear-gradient(90deg, #ff43a1, #ffb800, #00cfff)",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              borderRadius: "12px",
              padding: "0.7em 2em",
              fontSize: "1.1em",
              boxShadow: "0 2px 8px #0003",
              cursor: "pointer",
              letterSpacing: "1px",
              textShadow: "0 1px 6px #0006",
              outline: "none",
              transition: "background 0.2s, transform 0.1s",
            }}
            onClick={() => setShowHome(true)}
          >
            Home
          </button>
        </div>
      )}
      {/* Scoreboard */}
      <div
        style={{
          position: "fixed",
          top: 24,
          right: 32,
          zIndex: 100,
          background: "rgba(255,255,255,0.92)",
          borderRadius: "16px",
          boxShadow: "0 2px 12px #0002",
          padding: "1.2em 2em 1.2em 2em",
          minWidth: "90px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.7em",
          fontFamily: "inherit",
        }}
      >
        <div
          style={{
            fontSize: "2.2em",
            color: "#43a047",
            fontWeight: "bold",
            lineHeight: 1,
          }}
        >
          ✔️
        </div>
        <div
          style={{
            fontSize: "1.5em",
            color: "#43a047",
            fontWeight: "bold",
            marginBottom: "0.2em",
          }}
        >
          {correctCount}
        </div>
        <div
          style={{
            fontSize: "2.2em",
            color: "#d32f2f",
            fontWeight: "bold",
            lineHeight: 1,
          }}
        >
          ❌
        </div>
        <div
          style={{
            fontSize: "1.5em",
            color: "#d32f2f",
            fontWeight: "bold",
            marginBottom: "0.2em",
          }}
        >
          {wrongCount}
        </div>
        <div
          style={{
            fontSize: "1.1em",
            color: "#333",
            fontWeight: "bold",
            marginTop: "0.5em",
            letterSpacing: "0.04em",
          }}
        >
          Round {round}
        </div>
        <div style={{ fontSize: "0.9em", color: "#888", marginTop: "0.5em" }}>
          {currentCustomerNeeds} ice cream
          {currentCustomerNeeds !== 1 ? "s" : ""} left
        </div>
      </div>
      {gameOver && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "black",
            color: "red",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "4em",
            fontWeight: "bold",
            letterSpacing: "0.1em",
            textShadow: "0 0 24px #f00, 0 0 8px #fff",
          }}
        >
          GAME OVER
          <div
            style={{
              fontSize: "0.5em",
              color: "#fff",
              marginTop: "0.5em",
              textShadow: "0 1px 6px #0008",
              textAlign: "center",
            }}
          >
            Final Score:{" "}
            <span style={{ color: "#43a047", fontWeight: "bold" }}>
              {correctCount}
            </span>{" "}
            ✔️
            <br />
            Wrong:{" "}
            <span style={{ color: "#d32f2f", fontWeight: "bold" }}>
              {wrongCount}
            </span>{" "}
            ❌<br />
            Round reached:{" "}
            <span style={{ color: "#ffb800", fontWeight: "bold" }}>
              {round}
            </span>
          </div>
          <button
            style={{
              marginTop: "1.5em",
              background: "linear-gradient(90deg, #ffb800, #ff43a1, #00cfff)",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              borderRadius: "12px",
              padding: "0.7em 2.5em",
              fontSize: "0.5em",
              boxShadow: "0 2px 8px #0003",
              cursor: "pointer",
              letterSpacing: "1px",
              textShadow: "0 1px 6px #0006",
              outline: "none",
              transition: "background 0.2s, transform 0.1s",
            }}
            onClick={() => {
              setShowHome(true);
              setGameOver(false);
              setMoney(20);
              setMessage("");
              setTimer(60);
              setShowWrong(false);
              setCorrectCount(0);
              setWrongCount(0);
              setRound(1);
              setShowOutOfTime(false);
              setCustomerNeeds(Array(5).fill(1));
              setPaused(false);
              setSelectedFlavor(null);
              setSelectedToppings([]);
              setCustomers(
                Array.from({ length: 5 }, () => ({
                  avatar:
                    customerAvatars[
                      Math.floor(Math.random() * customerAvatars.length)
                    ],
                  order: {
                    flavor:
                      flavors[Math.floor(Math.random() * flavors.length)]
                        .flavor,
                    toppings: [
                      toppingsList[
                        Math.floor(Math.random() * toppingsList.length)
                      ],
                    ],
                  },
                }))
              );
            }}
          >
            Restart
          </button>
        </div>
      )}
      {showWrong && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "#d32f2f",
            color: "#fff",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "6em",
            fontWeight: "bold",
            letterSpacing: "0.1em",
            textShadow: "0 0 24px #fff, 0 0 8px #d32f2f",
            transition: "opacity 0.2s",
          }}
        >
          WRONG
        </div>
      )}
      {showOutOfTime && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "#fff",
            color: "red",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "6em",
            fontWeight: "bold",
            letterSpacing: "0.1em",
            textShadow: "0 0 24px #fff, 0 0 8px #d32f2f",
            transition: "opacity 0.2s",
          }}
        >
          OUT OF TIME
        </div>
      )}
      {paused && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            color: "#fff",
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "4em",
            fontWeight: "bold",
            letterSpacing: "0.1em",
            textShadow: "0 0 24px #fff, 0 0 8px #000",
            transition: "opacity 0.2s",
          }}
        >
          PAUSED
        </div>
      )}
      {/* Wrap the background and main shop in a fragment to fix adjacent JSX error */}
      <>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 0,
            background:
              "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 20%, #fbc2eb 40%, #a1c4fd 60%, #c2ffd8 80%, #fcb69f 100%)",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            pointerEvents: "none",
          }}
        />
        <div
          className={`ice-cream-shop`}
          style={{
            position: "relative",
            zIndex: 1,
            minHeight: "100vh",
            backgroundImage: `url('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia0.giphy.com%2Fmedia%2FS3JnLlDMJvujGdy61b%2Fsource.gif&f=1&nofb=1&ipt=aad761ae90553f4c653d69b7e57b8464b5887515ca4661bef9d5beaabbe89726')`,
            backgroundRepeat: "repeat",
            backgroundSize: "10%", // 20 times horizontally and vertically
            padding: "2em",
            boxSizing: "border-box",
            fontFamily: "Comic Sans MS, Comic Sans, cursive, sans-serif",
            color: "#333",
            transition: "background 0.5s",
          }}
        >
          <h1
            style={{
              background:
                "linear-gradient(90deg, #ff6a00, #ffb800, #00ff6a, #00cfff, #a259ff, #ff43a1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "2.5em",
              fontWeight: "bold",
              marginBottom: "0.5em",
              textShadow: "0 2px 8px #fff8",
            }}
          >
            Rachel's ice cream shop
          </h1>
          <div
            style={{
              fontWeight: "bold",
              fontSize: "1.2em",
              marginBottom: "1em",
              color: "#fff",
              textShadow: "0 1px 6px #0008",
            }}
          >
            Money: ${money}{" "}
            {gameOver ? (
              ""
            ) : (
              <span style={{ marginLeft: "1em", color: "#ff43a1" }}>
                ⏰ {timer}s
              </span>
            )}
          </div>
          <div
            style={{
              width: "100%",
              margin: "2em 0 1em 0",
              padding: "1.5em 1em 1em 1em",
              background: "rgba(255,255,255,0.85)",
              borderRadius: "24px 24px 8px 8px",
              boxShadow: "0 4px 16px #0002",
              borderBottom: "8px solid #e0b97f",
              position: "relative",
              minHeight: "120px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: "2em",
            }}
          >
            {customers.map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: i === 0 ? 1 : 0.7,
                  filter: i === 0 ? "none" : "grayscale(0.3)",
                  transform: i === 0 ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: "3em", marginBottom: "0.2em" }}>
                  {c.avatar}
                </div>
                <div
                  style={{
                    fontSize: "0.9em",
                    color: "#a67c52",
                    fontWeight: "bold",
                  }}
                >
                  Customer {i + 1}
                </div>
              </div>
            ))}
            {/* Countertop visual */}
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                width: "100%",
                height: "32px",
                background: "linear-gradient(90deg, #e0b97f 60%, #f7e1b5 100%)",
                borderRadius: "0 0 12px 12px",
                boxShadow: "0 4px 12px #0003",
                zIndex: 1,
              }}
            />
          </div>
          <div
            style={{
              margin: "1em 0",
              background: "rgba(255,255,255,0.7)",
              borderRadius: "12px",
              padding: "1em",
              boxShadow: "0 2px 8px #0002",
            }}
          >
            <strong>Customer Order:</strong> {customerOrder.flavor} with{" "}
            {customerOrder.toppings.join(", ")}
          </div>
          <div>
            <h2
              style={{
                background:
                  "linear-gradient(90deg, #ffb800, #00ff6a, #00cfff, #a259ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
                margin: "0.5em 0",
              }}
            >
              Pick a Flavor
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5em" }}>
              {flavors.map((f, i) => (
                <button
                  key={f.flavor}
                  style={{
                    background: `linear-gradient(135deg, hsl(${
                      i * 18
                    }, 90%, 80%), hsl(${(i * 18 + 60) % 360}, 90%, 90%))`,
                    color: "#333",
                    border:
                      selectedFlavor === f.flavor
                        ? "2px solid #2196f3"
                        : "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "0.5em 1em",
                    fontWeight: "bold",
                    cursor: "pointer",
                    minWidth: "90px",
                    boxShadow:
                      selectedFlavor === f.flavor
                        ? "0 0 8px #90caf9"
                        : "0 1px 4px #0002",
                    transition: "transform 0.1s",
                    transform:
                      selectedFlavor === f.flavor ? "scale(1.08)" : "none",
                    outline: "none",
                  }}
                  onClick={() => setSelectedFlavor(f.flavor)}
                >
                  {f.flavor}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h2
              style={{
                background: "linear-gradient(90deg, #ff43a1, #ffb800, #00cfff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
                margin: "0.5em 0",
              }}
            >
              Pick Toppings
            </h2>
            <div style={{ display: "flex", gap: "0.5em", flexWrap: "wrap" }}>
              {toppingsList.map((t, i) => (
                <label
                  key={t}
                  style={{
                    background: `linear-gradient(90deg, hsl(${
                      i * 60
                    }, 90%, 90%), hsl(${(i * 60 + 120) % 360}, 90%, 80%))`,
                    borderRadius: "8px",
                    padding: "0.3em 0.8em",
                    fontWeight: "bold",
                    color: "#333",
                    boxShadow: "0 1px 4px #0001",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    marginBottom: "0.3em",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedToppings.includes(t)}
                    onChange={() => handleToppingToggle(t)}
                    style={{ marginRight: "0.5em" }}
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <button
            style={{
              marginTop: "1em",
              background: "linear-gradient(90deg, #ffb800, #ff43a1, #00cfff)",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              borderRadius: "12px",
              padding: "0.7em 2em",
              fontSize: "1.1em",
              boxShadow: "0 2px 8px #0003",
              cursor: "pointer",
              letterSpacing: "1px",
              transition: "background 0.2s, transform 0.1s",
              textShadow: "0 1px 6px #0006",
              outline: "none",
            }}
            onClick={handleServe}
          >
            Serve Ice Cream
          </button>
          <div
            style={{
              marginTop: "1em",
              minHeight: "2em",
              fontWeight: "bold",
              color: "#ff43a1",
              textShadow: "0 1px 6px #fff8",
            }}
          >
            {message}
          </div>
          <div
            style={{
              marginTop: "2em",
              fontSize: "1em",
              color: "#fff",
              textShadow: "0 1px 6px #0008",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "8px",
              padding: "0.7em 1em",
              maxWidth: "500px",
            }}
          ></div>
          Learn how to make ice cream and handle money by serving customers the
          right order!
        </div>
      </>
    </>
  );
}

export default App;
