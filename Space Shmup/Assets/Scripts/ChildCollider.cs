using UnityEngine;
using System.Collections;
public class ChildCollider : MonoBehaviour
{
    void OnCollisionEnter2D(Collision2D collision)
    {
        Transform parent = this.gameObject.transform.parent;
        parent.GetComponent<Enemy_4>().SendMessage("OnCollisionEnter2D", collision);
    }
}
