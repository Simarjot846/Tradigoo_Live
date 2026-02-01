"use client";

import React from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';

export function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();

        // Spotlight
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);

        // Tilt
        const posX = clientX - left;
        const posY = clientY - top;

        const w = width;
        const h = height;

        const pctX = (posX / w) - 0.5;
        const pctY = (posY / h) - 0.5;

        x.set(pctX);
        y.set(pctY);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            className={`group relative border border-black/5 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden transform-gpu perspective-1000 ${className} shadow-xl dark:shadow-none`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 z-30"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(0, 0, 0, 0.05),
              transparent 80%
            )
          `,
                }}
            />
            <div className="relative h-full transform-style-3d group-hover:translate-z-10 transition-transform duration-200">
                {children}
            </div>
        </motion.div>
    );
}
