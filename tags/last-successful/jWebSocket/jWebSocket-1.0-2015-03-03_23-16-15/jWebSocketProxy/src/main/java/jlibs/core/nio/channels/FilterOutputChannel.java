/**
 * JLibs: Common Utilities for Java
 * Copyright (C) 2009  Santhosh Kumar T <santhosh.tekuri@gmail.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 */

package jlibs.core.nio.channels;

import java.io.IOException;

/**
 * @author Santhosh Kumar T
 */
public abstract class FilterOutputChannel extends OutputChannel{
    protected OutputChannel delegate;

    public FilterOutputChannel(OutputChannel delegate){
        super(delegate.client, delegate.nioSupport);
        this.delegate = delegate;
        setHandler(delegate.handler);
        delegate.setHandler(null);
        attach(delegate.attachment());
        delegate.attach(null);
    }

    @Override
    protected boolean activateInterest(){
        return delegate.activateInterest();
    }

    protected abstract void doWritePending() throws IOException;
    protected final void writePending() throws IOException {
        if(delegate.status()==Status.NEEDS_OUTPUT)
            delegate.writePending();
        if(delegate.status()!=Status.NEEDS_OUTPUT)
            doWritePending();
        if(selfStatus()==Status.COMPLETED){
            if(!isOpen())
                delegate.close();
        }
    }

    protected abstract Status selfStatus();

    public final Status status(){
        Status selfStatus = selfStatus();
        return selfStatus==Status.COMPLETED ? delegate.status() : selfStatus;
    }

    public OutputChannel unwrap(){
        delegate.setHandler(handler);
        this.setHandler(null);
        delegate.attach(attachment());
        attach(null);
        return delegate;
    }

    @Override
    public String toString(){
        return getClass().getSimpleName()+'('+delegate+')';
    }
}
