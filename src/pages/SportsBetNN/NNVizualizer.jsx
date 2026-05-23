import { useEffect, useRef, useMemo, useState, useCallback } from "react";

const valueToRGB = (value) => {
  const v = Math.max(-1, Math.min(1, value));
  if (v >= 0) {
    return [Math.round(80 - v * 60), Math.round(80 + v * 175), Math.round(80 - v * 60)];
  } else {
    const a = Math.abs(v);
    return [Math.round(80 + a * 175), Math.round(80 - a * 60), Math.round(80 - a * 60)];
  }
};

const valueToOpacity = (value) => 0.08 + Math.abs(value) * 0.6;

const getLayerCount = (layer) =>
  Array.isArray(layer) ? layer.length : (layer.nodes ?? layer);

const getWeight = (weights, li, fromIdx, toIdx) => {
  const lw = weights?.[li];
  if (!lw) return 0;
  if (Array.isArray(lw[fromIdx])) return lw[fromIdx][toIdx] ?? 0;
  const toCount = weights[li + 1] ? getLayerCount(weights[li + 1]) : 1;
  return lw[fromIdx * toCount + toIdx] ?? 0;
};

const getBias = (biases, li, ni) => {
  const lb = biases?.[li];
  if (!lb) return 0;
  return Array.isArray(lb) ? (lb[ni] ?? 0) : 0;
};

export default function NeuralNetworkViz({ network }) {
  const canvasRef = useRef(null);
  const { layers = [], weights = [], biases = [] } = network || {};

  const NODE_R = 4;
  const PAD_X = 50;
  const PAD_Y = 40;
  const MIN_NODE_GAP = 2;

  const wrapRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);

  const updateWidth = useCallback(() => {
    if (wrapRef.current) setContainerWidth(wrapRef.current.offsetWidth);
  }, []);

  useEffect(() => {
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [updateWidth]);

  const layerCounts = useMemo(() => layers.map(getLayerCount), [layers]);

  const canvasWidth = containerWidth;
  const LAYER_GAP = layers.length > 1
    ? (canvasWidth - PAD_X * 2) / (layers.length - 1)
    : canvasWidth - PAD_X * 2;

  const canvasHeight = useMemo(() => {
    const maxNodes = Math.max(...layerCounts, 1);
    return Math.max(400, PAD_Y * 2 + maxNodes * (NODE_R * 2 + MIN_NODE_GAP));
  }, [layerCounts]);

  // Precompute node centers
  const nodeCenters = useMemo(() => {
    return layerCounts.map((count, li) => {
      const x = PAD_X + li * LAYER_GAP;
      const totalH = count * (NODE_R * 2 + MIN_NODE_GAP) - MIN_NODE_GAP;
      const startY = PAD_Y + (canvasHeight - PAD_Y * 2 - totalH) / 2 + NODE_R;
      return Array.from({ length: count }, (_, ni) => ({
        x,
        y: startY + ni * (NODE_R * 2 + MIN_NODE_GAP),
      }));
    });
  }, [layerCounts, canvasHeight, LAYER_GAP]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || layers.length < 2) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = canvasWidth + "px";
    canvas.style.height = canvasHeight + "px";
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#0d0d0d";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw weights (edges) first
    for (let li = 0; li < nodeCenters.length - 1; li++) {
      const fromNodes = nodeCenters[li];
      const toNodes = nodeCenters[li + 1];
      for (let fi = 0; fi < fromNodes.length; fi++) {
        for (let ti = 0; ti < toNodes.length; ti++) {
          const w = getWeight(weights, li, fi, ti);
          const [r, g, b] = valueToRGB(w);
          const alpha = valueToOpacity(w);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(fromNodes[fi].x, fromNodes[fi].y);
          ctx.lineTo(toNodes[ti].x, toNodes[ti].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes on top
    for (let li = 0; li < nodeCenters.length; li++) {
      for (let ni = 0; ni < nodeCenters[li].length; ni++) {
        const { x, y } = nodeCenters[li][ni];
        const bias = getBias(biases, li, ni);
        const [r, g, b] = valueToRGB(bias);

        // Node fill
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(x, y, NODE_R, 0, Math.PI * 2);
        ctx.fill();

        // Node border colored by bias
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, NODE_R, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Layer labels
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    for (let li = 0; li < layers.length; li++) {
      const x = PAD_X + li * LAYER_GAP;
      const label = li === 0 ? "INPUT" : li === layers.length - 1 ? "OUTPUT" : `HIDDEN ${li}`;
      ctx.fillStyle = "#555";
      ctx.fillText(label, x, canvasHeight - 16);
      ctx.fillStyle = "#333";
      ctx.fillText(`${layerCounts[li]} nodes`, x, canvasHeight - 4);
    }
  }, [nodeCenters, layers, weights, biases, canvasWidth, canvasHeight, layerCounts]);

  if (!layers || layers.length < 2) {
    return (
      <div style={styles.wrapper}>
        <div style={{ ...styles.card, color: "#444", fontSize: "11px", letterSpacing: "2px" }}>
          NO NETWORK DATA
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.label}>NETWORK</span>
          <h2 style={styles.title}>Architecture</h2>
          <div style={styles.legend}>
            <span style={{ ...styles.dot, background: "#d04040" }} />
            <span style={styles.legendText}>−1</span>
            <span style={{ ...styles.dot, background: "#505050" }} />
            <span style={styles.legendText}>0</span>
            <span style={{ ...styles.dot, background: "#40c060" }} />
            <span style={styles.legendText}>+1</span>
          </div>
        </div>

        <div ref={wrapRef} style={styles.canvasWrap}>
          <canvas ref={canvasRef} style={{ display: "block" }} />
        </div>

        <div style={styles.stats}>
          {layerCounts.map((count, i) => (
            <div key={i} style={styles.stat}>
              <div style={styles.statVal}>{count}</div>
              <div style={styles.statKey}>L{i}</div>
            </div>
          ))}
          <div style={{ ...styles.stat, marginLeft: "auto" }}>
            <div style={styles.statVal}>
              {layerCounts.slice(0, -1).reduce((sum, c, i) => sum + c * layerCounts[i + 1], 0).toLocaleString()}
            </div>
            <div style={styles.statKey}>WEIGHTS</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    background: "#0d0d0d",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'JetBrains Mono', monospace",
    padding: "24px",
  },
  card: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: "4px",
    padding: "28px",
    width: "100%",
  },
  header: {
    marginBottom: "20px",
    borderBottom: "1px solid #1e1e1e",
    paddingBottom: "16px",
    display: "flex",
    alignItems: "baseline",
    gap: "16px",
  },
  label: { color: "#333", fontSize: "9px", letterSpacing: "3px" },
  title: {
    color: "#eee", fontSize: "15px", fontWeight: "400",
    margin: 0, letterSpacing: "2px", textTransform: "uppercase", flex: 1,
  },
  legend: { display: "flex", alignItems: "center", gap: "6px" },
  dot: { width: "8px", height: "8px", borderRadius: "50%", display: "inline-block" },
  legendText: { color: "#444", fontSize: "9px", marginRight: "6px" },
  canvasWrap: { background: "#0d0d0d", borderRadius: "2px", overflowX: "auto" },
  stats: {
    display: "flex", gap: "20px", marginTop: "16px",
    paddingTop: "14px", borderTop: "1px solid #1a1a1a",
  },
  stat: { textAlign: "center" },
  statVal: { color: "#888", fontSize: "14px" },
  statKey: { color: "#333", fontSize: "8px", letterSpacing: "2px", marginTop: "2px" },
};
