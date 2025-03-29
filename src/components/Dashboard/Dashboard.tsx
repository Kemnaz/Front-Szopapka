import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, ChangeEvent, Key } from "react";
import { Card } from "../Card/Card";
import "./Dashboard.css";
import { DUMMY_FAMILIES } from "../Dummyfiles/DUMMY.FAMILIES";

interface Family {
  id: Key;
  name: string;
  img: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [families, setFamilies] = useState<Family[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [joinCode, setJoinCode] = useState<string>("");
  const [newFamilyName, setNewFamilyName] = useState<string>("");
  const [newFamilyImg, setNewFamilyImg] = useState<File | null>(null);

  const fetchFamilies = async () => {
    try {
      const response = await fetch("api/jakies");
      if (!response.ok) {
        throw new Error("serwer krzyczy ze nie jest ok :(");
      }
      const data: Family[] = await response.json();
      setFamilies(data);
    } catch (error) {
      console.error("nie udalo sie zlapac rodzin :(", error);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const handleAddClick = () => {
    setIsAdding(true);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewFamilyName(e.target.value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewFamilyImg(e.target.files[0]);
    }
  };
  const handleJoinCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setJoinCode(e.target.value);
  };
  const handleJoinFamily = async () => {
    if (!joinCode) {
      console.error("Kod dołączenia jest wymagany");
      return;
    }

    try {
      const response = await fetch("/api/rodziny/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ joinCode }),
      });

      if (!response.ok) {
        setJoinCode("Failed to join family");

        throw new Error("Nie udało się dołączyć do rodziny");
      }

      await fetchFamilies();

      setJoinCode("");
      setIsJoining(false);
    } catch (error) {
      console.error("Nie udało się dołączyć do rodziny", error);
    }
  };
  const handleAddFamily = async () => {
    if (!newFamilyName || !newFamilyImg) return;

    try {
      const formData = new FormData();
      formData.append("image", newFamilyImg);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Image upload failed");
      }

      const imageUrl = await uploadResponse.json();

      const newFamily = { name: newFamilyName, img: imageUrl };

      const response = await fetch("/api/rodziny", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFamily),
      });

      if (!response.ok) {
        throw new Error("serwer krzyczy ze nie udalo sie dodac rodziny :(");
      }

      const addedFamily: Family = await response.json();
      setFamilies([...families, addedFamily]);
      setNewFamilyName("");
      setNewFamilyImg(null);
      setIsAdding(false);
    } catch (error) {
      console.error("Nie udalo sie dodac rodziny :(", error);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        {isJoining ? (
          <>
            <input
              type="text"
              placeholder="Wpisz kod dołączenia"
              value={joinCode}
              onChange={handleJoinCodeChange}
              className="card__input"
            />
            <div className="flex-bruh">
              <button className="card__button" onClick={handleJoinFamily}>
                DOŁĄCZ
              </button>
              <button
                className="card__button card__button--red"
                onClick={() => setIsJoining(false)}
              >
                Anuluj
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="dashboard__label">Masz kod dołączenia? Dołącz:</p>
            <button className="card__button" onClick={() => setIsJoining(true)}>
              DOŁĄCZ
            </button>
          </>
        )}
      </div>

      <ul className="dashboard__list">
        <li className="dashboard__list-item">
          {isAdding ? (
            <div className="card card--form">
              <input
                type="text"
                placeholder="Nazwa rodziny"
                value={newFamilyName}
                onChange={handleNameChange}
                className="card__input"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="card__input"
              />
              <div className="flex-bruh">
                <button className="card__button" onClick={handleAddFamily}>
                  Dodaj rodzinę
                </button>
                <button
                  className="card__button card__button--red"
                  onClick={() => setIsAdding(false)}
                >
                  Cofnij
                </button>
              </div>
            </div>
          ) : (
            <div className="card card--add" onClick={handleAddClick}>
              <div className="card__image-container card__image-container--add">
                <span className="card__plus">➕</span>
              </div>
              <h2 className="card__title">Dodaj rodzinę</h2>
            </div>
          )}
        </li>
        {families.length
          ? families.map((family) => (
              <li className="dashboard__list-item" key={family.id}>
                <Card nazwa={family.name} img={family.img} id={family.id} />
              </li>
            ))
          : DUMMY_FAMILIES.map((family, index) => (
              <li className="dashboard__list-item" key={index}>
                <Card nazwa={family.name} img={family.img} id={family.id} />
              </li>
            ))}
      </ul>
    </div>
  );
};

export default Dashboard;
