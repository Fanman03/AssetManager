"use client";
import React, { Component } from 'react';

export default class LoadingSpinner extends Component {
    render() {
        return (
            <main className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
            </main>
        );
    }
}