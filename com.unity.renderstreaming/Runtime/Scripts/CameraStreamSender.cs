using Unity.WebRTC;
using UnityEngine;
using UnityEngine.Experimental.Rendering;
using System.Threading.Tasks;

namespace Unity.RenderStreaming
{
    /// <summary>
    /// 
    /// </summary>
    [RequireComponent(typeof(Camera))]
    public class CameraStreamSender : VideoStreamSender
    {
        /// <summary>
        /// 
        /// </summary>
        [SerializeField, RenderTextureDepthBuffer]
        private int depth = 0;

        /// <summary>
        /// 
        /// </summary>
        [SerializeField, RenderTextureAntiAliasing]
        private int antiAliasing = 1;

        /// <summary>
        /// 
        /// </summary>
        public override Texture SendTexture => m_camera.targetTexture;

        private Camera m_camera;

        protected virtual void Awake()
        {
            m_camera = GetComponent<Camera>();
        }

        protected override MediaStreamTrack CreateTrack()
        {
            RenderTexture rt;
            if (m_camera.targetTexture != null)
            {
                rt = m_camera.targetTexture;
                RenderTextureFormat supportFormat = WebRTC.WebRTC.GetSupportedRenderTextureFormat(SystemInfo.graphicsDeviceType);
                GraphicsFormat graphicsFormat = GraphicsFormatUtility.GetGraphicsFormat(supportFormat, RenderTextureReadWrite.Default);
                GraphicsFormat compatibleFormat = SystemInfo.GetCompatibleFormat(graphicsFormat, FormatUsage.Render);
                GraphicsFormat format = graphicsFormat == compatibleFormat ? graphicsFormat : compatibleFormat;

                if (rt.graphicsFormat != format)
                {
                    Debug.LogWarning(
                        $"This color format:{rt.graphicsFormat} not support in unity.webrtc. Change to supported color format:{format}.");
                    rt.Release();
                    rt.graphicsFormat = format;
                    rt.Create();
                }

                m_camera.targetTexture = rt;
            }
            else
            {
                RenderTextureFormat format = WebRTC.WebRTC.GetSupportedRenderTextureFormat(SystemInfo.graphicsDeviceType);
                rt = new RenderTexture(streamingSize.x, streamingSize.y, depth, format)
                {
                    antiAliasing = antiAliasing
                };
                rt.Create();
                m_camera.targetTexture = rt;
            }
            OnStartedStream += (connectionID) => { ChangeVideoParametersAfterDelay(connectionID); };
            return new VideoStreamTrack(rt);
        }
        // Task to change video parameters after delay (to increase the max bitrate)
        async Task ChangeVideoParametersAfterDelay(string connectionID)
        {
            while (true)
            {
                if (Senders.TryGetValue(connectionID, out var sender))
                {
                    RTCRtpSendParameters parameters = sender.GetParameters();
                    if (parameters.encodings.Length > 0)
                    {
                        break;
                    }
                }
                await Task.Delay(50);
            }
            this.ChangeVideoParameters(connectionID, 1000 * 1024 * 1024, 30);
        }
    }
}
