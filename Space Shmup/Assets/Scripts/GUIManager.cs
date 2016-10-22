using UnityEngine;
using System.Collections;
using UnityEngine.SceneManagement;

public class GUIManager : MonoBehaviour {
    public static GUIManager S; // singleton
    public UnityEngine.UI.Text scoringText; // Scoring text
                                            // Use this for initialization
    void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
	
	}
    void Awake()
    {
        S = this;
    }
    public void UpdateScore(int newScore)
    {
        string score = "Score: " + newScore;
        scoringText.text = score;
    }
    public void startPressed()
    {
        SceneManager.LoadScene("Scene_0");
    }
}
