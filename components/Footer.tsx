"use client";
import React, { Component } from 'react';

export default class Footer extends Component {
    render() {
        return (
            <footer className="d-flex mt-auto flex-wrap justify-content-between align-items-center py-3 px-3 border-top">
                <div className="col-md-4 d-flex align-items-center">
                    <a href="/" className="mb-3 me-2 mb-md-0 text-muted text-decoration-none lh-1">
                        <i className="bi bi-pc-display me-2"></i>
                        <span className="mb-3 mb-md-0 text-muted">Asset Manager v2.0 by Jack Pendleton</span>
                    </a>
                </div>
                <ul className="nav col-md-4 justify-content-end list-unstyled d-flex">
                    <li className="ms-3">
                        <a className="text-muted" href="https://github.com/Fanman03/AssetManager" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-github"></i>
                        </a>
                    </li>
                    <li className="ms-3">
                        <a className="text-muted" href="https://www.patreon.com/fanman03" target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-piggy-bank-fill"></i>
                        </a>
                    </li>
                </ul>
            </footer>
        );
    }
}